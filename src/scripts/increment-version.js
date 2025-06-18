// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// Путь к config.json
const configPath = path.join(__dirname, '..', 'config', 'config.json');

try {
  const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Получение текущей версии и разбиение на компоненты
  const currentVersion = configData.versions.version;
  const versionParts = currentVersion.split('.');

  // Увеличение патч-версии (третьего числа)
  versionParts[2] = (parseInt(versionParts[2], 10) + 1).toString();

  // Обновление версии в конфигурации
  configData.versions.version = versionParts.join('.');

  // Запись обновленной конфигурации обратно в файл
  fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

  console.log(`Версия обновлена до ${configData.versions.version}`);
} catch (error) {
  console.error('Ошибка при обновлении версии:', error);
  process.exit(1);
}
