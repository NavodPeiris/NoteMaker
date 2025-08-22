import { motion, useMotionValue, useTransform } from 'framer-motion'
import NoteImg from '@/assets/note.png'

export function NoteCard3D() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-100, 100], [15, -15])
  const rotateY = useTransform(x, [-100, 100], [-15, 15])

  return (
    <div className="w-64 h-64" style={{ perspective: 1000 }}>
      <motion.div
        className="w-full h-full rounded-xl shadow-lg bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={(e) => {
          const bounds = e.currentTarget.getBoundingClientRect()
          const centerX = bounds.left + bounds.width / 2
          const centerY = bounds.top + bounds.height / 2

          x.set(e.clientX - centerX)
          y.set(e.clientY - centerY)
        }}
        onMouseLeave={() => {
          x.set(0)
          y.set(0)
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <img
          src={NoteImg}
          alt="Note"
          className="w-full h-full object-cover rounded-xl"
        />
      </motion.div>
    </div>
  )
}
