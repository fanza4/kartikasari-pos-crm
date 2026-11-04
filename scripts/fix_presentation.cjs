const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function fixPresentation(inputPath, outputPath) {
  console.log(`Processing: ${inputPath}`);
  const data = fs.readFileSync(inputPath);
  const zip = await JSZip.loadAsync(data);

  // 1. Fix notesMaster1.xml if present
  if (zip.files['ppt/notesMasters/notesMaster1.xml']) {
    let nm = await zip.files['ppt/notesMasters/notesMaster1.xml'].async('string');
    // Replace spTree content with clean spTree (without the 6 invalid placeholder shapes)
    const cleanSpTree = '<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree>';
    nm = nm.replace(/<p:spTree>[\s\S]*?<\/p:spTree>/, cleanSpTree);
    zip.file('ppt/notesMasters/notesMaster1.xml', nm);
    console.log('  -> Patched ppt/notesMasters/notesMaster1.xml successfully.');
  }

  // 2. Remove empty chart/embedding folders that confuse PowerPoint
  const emptyDirs = ['ppt/charts/', 'ppt/charts/_rels/', 'ppt/embeddings/'];
  for (const dir of emptyDirs) {
    if (zip.files[dir]) {
      zip.remove(dir);
      console.log(`  -> Removed phantom empty directory: ${dir}`);
    }
  }

  // 3. Generate sanitized PPTX
  const outputBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  fs.writeFileSync(outputPath, outputBuffer);
  console.log(`✅ Saved fixed presentation to: ${outputPath} (${outputBuffer.length} bytes)`);
}

async function run() {
  const root = path.resolve(__dirname, '..');
  const src = path.join(root, 'PRD_Mie_Baso_Kartika_Sari.pptx');
  const dest = path.join(root, 'PRD_Mie_Baso_Kartika_Sari_Fixed.pptx');
  await fixPresentation(src, dest);
}

run().catch(console.error);
