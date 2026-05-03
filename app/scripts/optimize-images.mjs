import path from 'node:path';
import { mkdir, readdir, stat } from 'node:fs/promises';
import sharp from 'sharp';

const rootDir = process.cwd();
const imageDir = path.join(rootDir, 'public', 'images');
const outputDir = path.join(imageDir, 'generated');
const widths = [480, 768, 1024];
const webpQuality = 82;
const avifQuality = 58;

await mkdir(outputDir, { recursive: true });

const files = await readdir(imageDir);
const pngFiles = files.filter((file) => file.endsWith('.png'));

for (const file of pngFiles) {
  const inputPath = path.join(imageDir, file);
  const { name } = path.parse(file);
  const metadata = await sharp(inputPath).metadata();
  const sourceWidth = metadata.width ?? widths.at(-1);

  for (const width of widths) {
    if (sourceWidth && width > sourceWidth) continue;

    const outputPath = path.join(outputDir, `${name}-${width}.webp`);
    await sharp(inputPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: webpQuality })
      .toFile(outputPath);

    const outputStats = await stat(outputPath);
    console.log(`${path.relative(rootDir, outputPath)} ${(outputStats.size / 1024).toFixed(1)} KB`);

    const avifOutputPath = path.join(outputDir, `${name}-${width}.avif`);
    await sharp(inputPath)
      .resize({ width, withoutEnlargement: true })
      .avif({ quality: avifQuality, effort: 5 })
      .toFile(avifOutputPath);

    const avifOutputStats = await stat(avifOutputPath);
    console.log(`${path.relative(rootDir, avifOutputPath)} ${(avifOutputStats.size / 1024).toFixed(1)} KB`);
  }
}
