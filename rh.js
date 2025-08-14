const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const DEBUG_DIR = '/tmp/reyohoho-debug';

// Убедимся, что директория для отладки существует
if (!fs.existsSync(DEBUG_DIR)) {
    fs.mkdirSync(DEBUG_DIR, { recursive: true });
}

async function saveDebugData(page, stepName) {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = `${DEBUG_DIR}/${stepName}-${timestamp}.png`;
        const htmlPath = `${DEBUG_DIR}/${stepName}-${timestamp}.html`;
        
        await page.screenshot({ path: screenshotPath, fullPage: true });
        const html = await page.content();
        fs.writeFileSync(htmlPath, html);
        
        console.log(`[DEBUG] Saved ${stepName}`);
        return true;
    } catch (e) {
        console.error(`[DEBUG ERROR] Failed to save ${stepName}:`, e);
        return false;
    }
}

app.post('/api/get-stream', async (req, res) => {
    let browser;
    try {
        const { title, year } = req.body;
        console.log(`Starting search for: ${title} (${year})`);
        
        // Инициализация браузера с расширенными параметрами
        browser = await puppeteer.launch({
            headless: false, // Включим headful для отладки
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--window-size=1280,720'
            ],
            executablePath: '/usr/bin/chromium',
            dumpio: true // Подробное логирование
        });

        const page = await browser.newPage();
        
        // Включим полное логирование
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure()));
        
        // 1. Переходим на главную страницу
        console.log('Navigating to homepage...');
        await page.goto('https://reyohoho.github.io/reyohoho/', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });
        await saveDebugData(page, '01-homepage');
        
        // 2. Проверяем наличие элементов поиска
        console.log('Checking search elements...');
        const searchExists = await page.evaluate(() => {
            const input = document.querySelector('.search-input');
            const button = document.querySelector('.search-button');
            return {
                inputExists: !!input,
                buttonExists: !!button,
                pageTitle: document.title,
                bodyText: document.body.innerText.substring(0, 200) + '...'
            };
        });
        
        console.log('Search elements check:', searchExists);
        if (!searchExists.inputExists || !searchExists.buttonExists) {
            throw new Error('Search elements not found on page');
        }
        
        // 3. Выполняем поиск
        console.log('Performing search...');
        await page.type('.search-input', `${title} ${year}`, { delay: 100 });
        await saveDebugData(page, '02-after-typing');
        
        await page.click('.search-button');
        await saveDebugData(page, '03-after-search-click');
        
        // 4. Ждем результаты - несколько стратегий
        console.log('Waiting for results...');
        try {
            // Стратегия 1: Ждем появления карточек
            await page.waitForSelector('.movie-card', { timeout: 30000 });
            console.log('Found movie cards');
        } catch (e) {
            console.log('Movie cards not found, trying alternative detection...');
            
            // Стратегия 2: Проверяем любой контент после поиска
            const anyContent = await page.evaluate(() => {
                return document.body.innerText.length > 100;
            });
            
            if (!anyContent) {
                throw new Error('No content loaded after search');
            }
            
            await saveDebugData(page, '04-after-search-no-cards');
            console.log('Content found but no cards detected');
        }
        
        // 5. Проверяем, что вообще есть на странице
        const pageContent = await page.evaluate(() => {
            return {
                title: document.title,
                html: document.documentElement.outerHTML.substring(0, 500) + '...',
                text: document.body.innerText.substring(0, 500) + '...'
            };
        });
        
        console.log('Current page content:', pageContent);
        await saveDebugData(page, '05-final-state');
        
        res.json({
            success: false,
            debug: {
                screenshots: DEBUG_DIR,
                pageContent: pageContent,
                message: 'Debug data saved, check server logs'
            }
        });
        
    } catch (error) {
        console.error('Fatal error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            debug: {
                dir: DEBUG_DIR,
                instruction: 'Check debug files and server logs'
            }
        });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Debug files will be saved to: ${DEBUG_DIR}`);
});
