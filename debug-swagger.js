const fs = require('fs');
const path = require('path');

function findCircularDependencies(dir, visited = new Set(), currentPath = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (
      stat.isDirectory() &&
      !file.startsWith('.') &&
      file !== 'node_modules'
    ) {
      findCircularDependencies(fullPath, visited, currentPath);
    } else if (file.endsWith('.dto.ts') || file.endsWith('.entity.ts')) {
      checkFileForCircularImports(fullPath);
    }
  }
}

function checkFileForCircularImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports =
      content.match(/import\s+.*?\s+from\s+['"][^'"]+['"]/g) || [];

    console.log(`\n=== ${filePath} ===`);

    imports.forEach((importLine) => {
      console.log(`  ${importLine}`);
    });

    // Buscar @ApiProperty sin import
    const hasApiProperty = content.includes('@ApiProperty');
    const hasApiPropertyImport =
      content.includes('import { ApiProperty }') ||
      content.includes('import { ApiProperty,');

    if (hasApiProperty && !hasApiPropertyImport) {
      console.log(
        `  ⚠️  PROBLEMA: Usa @ApiProperty pero no importa ApiProperty`,
      );
    }

    // Buscar referencias circulares comunes
    const problematicPatterns = [
      /import.*\.entity.*from.*\.dto/,
      /import.*\.dto.*from.*\.entity/,
      /type:\s*\(\)\s*=>\s*[A-Z]\w*Dto/,
    ];

    problematicPatterns.forEach((pattern) => {
      if (pattern.test(content)) {
        console.log(`  🔴 POSIBLE CIRCULAR: ${pattern}`);
      }
    });
  } catch (error) {
    console.error(`Error leyendo ${filePath}:`, error.message);
  }
}

console.log('🔍 Buscando dependencias circulares en DTOs y entidades...\n');
findCircularDependencies('./src');

console.log(
  '\n\n🔍 Verificando archivos específicos que pueden causar problemas...\n',
);

// Archivos específicos a verificar
const specificFiles = [
  './src/core/inscriptions/dto/inscription.dto.ts',
  './src/core/inscriptions/dto/course-inscription.dto.ts',
  './src/core/people/employee/entities/employee.entity.ts',
  './src/core/school-year/entities/course-school-year.entity.ts',
];

specificFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    checkFileForCircularImports(file);
  } else {
    console.log(`❌ Archivo no encontrado: ${file}`);
  }
});
