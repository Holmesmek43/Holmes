// Generates minimal SVG-based PNG icons for PWA
// Run: node scripts/gen-icons.js
import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../public/icons')
mkdirSync(outDir, { recursive: true })

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#0f0f1a'
  ctx.roundRect(0, 0, size, size, size * 0.18)
  ctx.fill()

  // Neon border
  ctx.strokeStyle = '#00f5ff'
  ctx.lineWidth = size * 0.03
  ctx.shadowColor = '#00f5ff'
  ctx.shadowBlur = size * 0.1
  ctx.roundRect(size * 0.04, size * 0.04, size * 0.92, size * 0.92, size * 0.15)
  ctx.stroke()

  // Dice face (simple)
  ctx.shadowBlur = 0
  ctx.fillStyle = '#1a1a3e'
  ctx.roundRect(size * 0.2, size * 0.2, size * 0.6, size * 0.6, size * 0.08)
  ctx.fill()

  // Dots
  ctx.fillStyle = '#00f5ff'
  ctx.shadowColor = '#00f5ff'
  ctx.shadowBlur = size * 0.04
  const dotR = size * 0.07
  const positions = [
    [0.35, 0.35], [0.65, 0.35],
    [0.50, 0.50],
    [0.35, 0.65], [0.65, 0.65],
  ]
  positions.forEach(([x, y]) => {
    ctx.beginPath()
    ctx.arc(size * x, size * y, dotR, 0, Math.PI * 2)
    ctx.fill()
  })

  writeFileSync(join(outDir, `icon-${size}.png`), canvas.toBuffer('image/png'))
  console.log(`Generated icon-${size}.png`)
}

[192, 512].forEach(generateIcon)
