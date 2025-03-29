
import { motion } from 'framer-motion'

interface MenuProps {
  onStart: () => void
  highScore: number
}

export const Menu = ({ onStart, highScore }: MenuProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
        Snake Game
      </h1>
      
      <div className="mb-8">
        <p className="text-xl mb-2">High Score: {highScore}</p>
        <p className="text-gray-400">Use arrow keys to move</p>
        <p className="text-gray-400">Space to pause</p>
      </div>

      <motion.button
        onClick={onStart}
        className="px-8 py-3 bg-purple-600 rounded-lg text-xl font-semibold"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Start Game
      </motion.button>

      <div className="mt-12 grid grid-cols-3 gap-4">
        <div className="p-4 bg-gray-800 rounded-lg">
          <div className="w-8 h-8 bg-yellow-400 rounded-full mx-auto mb-2" />
          <p className="text-sm">Speed Boost</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg">
          <div className="w-8 h-8 bg-blue-400 rounded-full mx-auto mb-2" />
          <p className="text-sm">2x Points</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg">
          <div className="w-8 h-8 bg-purple-400 rounded-full mx-auto mb-2" />
          <p className="text-sm">Shield</p>
        </div>
      </div>
    </motion.div>
  )
}