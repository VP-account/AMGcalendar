const fs = require('fs');
const path = require('path');

// Карта замін: старий колір -> нова змінна
const COLOR_MAP = {
    '#4f46e5': 'var(--color-primary)',
    '#4338ca': 'var(--color-primary-dark)',
    '#e0e7ff': 'var(--color-primary-light)',
    '#8b5cf6': 'var(--color-secondary)',
    '#f9fafb': 'var(--color-background)',
    '#ffffff': 'var(--color-surface)',
    '#e5e7eb': 'var(--color-border)',
    '#f3f4f6': 'var(--color-border-light)',
    '#1f2937': 'var(--color-text-primary)',
    '#374151': 'var(--color-text-secondary)',
    '#6b7280': 'var(--color-text-secondary)',
    '#9ca3af': 'var(--color-text-muted)',
    '#111827': 'var(--color-text-primary)',
    '#10b981': 'var(--color-success)',
    '#d1fae5': 'var(--color-success-bg)',
    '#f59e0b': 'var(--color-warning)',
    '#dc2626': 'var(--color-error)',
    '#fee2e2': 'var(--color-error-bg)',
    '#3b82f6': 'var(--color-info)',
};

function replaceInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // Заміняємо всі кольори
        for (const [oldColor, newVar] of Object.entries(COLOR_MAP)) {
            const regex = new RegExp(oldColor, 'g');
            content = content.replace(regex, newVar);
        }

        // Якщо щось змінилося - зберігаємо
        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Оновлено: ${path.relative(process.cwd(), filePath)}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error(`❌ Помилка у файлі ${filePath}:`, error.message);
        return false;
    }
}

function processDirectory(dirPath) {
    try {
        const items = fs.readdirSync(dirPath);
        let updatedCount = 0;

        for (const item of items) {
            const fullPath = path.join(dirPath, item);

            // Пропускаємо node_modules та інші служебні папки
            if (item === 'node_modules' || item.startsWith('.') || item === 'next' || item === '.next') {
                continue;
            }

            const stats = fs.statSync(fullPath);

            if (stats.isDirectory()) {
                // Рекурсивно обробляємо піддиректорії
                updatedCount += processDirectory(fullPath);
            } else if (stats.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js'))) {
                // Обробляємо тільки React файли
                if (replaceInFile(fullPath)) {
                    updatedCount++;
                }
            }
        }

        return updatedCount;
    } catch (error) {
        console.error(`❌ Помилка в директорії ${dirPath}:`, error.message);
        return 0;
    }
}

// Головна функція
function main() {
    console.log('🔄 Починаємо заміну кольорів на CSS змінні...\n');

    const startDir = path.join(__dirname, 'app');

    if (!fs.existsSync(startDir)) {
        console.error('❌ Директорія "app" не знайдена!');
        console.log('Запустіть скрипт з кореня проекту.');
        return;
    }

    const updatedFiles = processDirectory(startDir);

    console.log(`\n🎉 Готово! Оновлено файлів: ${updatedFiles}`);
    console.log('Тепер всі кольори використовують CSS змінні з app/layout.tsx');
    console.log('\nЩоб змінити кольори тепер достатньо змінити значення в:');
    console.log('app/layout.tsx → :root { ... }');
}

// Запускаємо
main();