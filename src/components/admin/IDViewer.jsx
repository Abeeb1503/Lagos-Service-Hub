import { useState } from 'react'
import Card from '../common/Card.jsx'
import Button from '../common/Button.jsx'

export default function IDViewer({ src, alt = 'ID Document' }) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  function zoomIn() {
    setScale((s) => Math.min(3, s + 0.25))
  }
  function zoomOut() {
    setScale((s) => Math.max(0.5, s - 0.25))
  }
  function rotate() {
    setRotation((r) => (r + 90) % 360)
  }
  function reset() {
    setScale(1)
    setRotation(0)
  }

  return (
    <Card className="p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={zoomOut}>-</Button>
        <Button variant="outline" onClick={zoomIn}>+</Button>
        <Button variant="outline" onClick={rotate}>Rotate</Button>
        <Button variant="outline" onClick={reset}>Reset</Button>
      </div>
      <div className="overflow-auto border border-border rounded">
        <img
          src={src}
          alt={alt}
          style={{ transform: `scale(${scale}) rotate(${rotation}deg)`, transformOrigin: 'center center' }}
          className="max-w-full h-auto m-auto"
        />
      </div>
    </Card>
  )
}
