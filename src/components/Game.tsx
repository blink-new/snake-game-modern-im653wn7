
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play } from 'lucide-react'

interface Position {
  x: number
  y: number
}

interface PowerUp {
  position: Position
  type: 'speed' | 'multiply' | 'shield'
}

interface GameProps {
  onGameOver: (score: number) => void
  isPaused: boolean
  onPause: () => void
  onResume: () => void
  score: number
  setScore: (score: number) => void
}

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SPEED = 150
const SPEED_BOOST_MULTIPLIER = 0.7
const POINT_MULTIPLIER = 2

export const Game = ({ onGameOver, isPaused, onPause, onResume, score, setScore }: GameProps) => {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT')
  const [food, setFood] = useState<Position>({ x: 15, y: 10 })
  const [obstacles, setObstacles] = useState<Position[]>([])
  const [powerUps, setPowerUps] = useState<PowerUp[]>([])
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [hasShield, setHasShield] = useState(false)
  const [pointMultiplier, setPointMultiplier] = useState(1)
  
  const gameLoopRef = useRef<number>()
  const lastRenderTimeRef = useRef<number>(0)

  const generateRandomPosition = (): Position => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
  }

  const checkCollision = (pos: Position, target: Position) => {
    return pos.x === target.x && pos.y === target.y
  }

  const moveSnake = () => {
    const head = snake[0]
    const newHead = { ...head }

    switch (direction) {
      case 'UP':
        newHead.y = (newHead.y - 1 + GRID_SIZE) % GRID_SIZE
        break
      case 'DOWN':
        newHead.y = (newHead.y + 1) % GRID_SIZE
        break
      case 'LEFT':
        newHead.x = (newHead.x - 1 + GRID_SIZE) % GRID_SIZE
        break
      case 'RIGHT':
        newHead.x = (newHead.x + 1) % GRID_SIZE
        break
    }

    // Check self-collision
    if (snake.some(segment => checkCollision(segment, newHead)) && !hasShield) {
      onGameOver(score)
      return
    }

    // Check obstacle collision
    if (obstacles.some(obstacle => checkCollision(obstacle, newHead)) && !hasShield) {
      onGameOver(score)
      return
    }

    const newSnake = [newHead, ...snake]

    // Check food collision
    if (checkCollision(newHead, food)) {
      setScore(score + (10 * pointMultiplier))
      setFood(generateRandomPosition())
      
      // Randomly spawn power-up
      if (Math.random() < 0.3) {
        const powerUpTypes: PowerUp['type'][] = ['speed', 'multiply', 'shield']
        setPowerUps([...powerUps, {
          position: generateRandomPosition(),
          type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]
        }])
      }

      // Randomly add obstacle
      if (Math.random() < 0.3) {
        setObstacles([...obstacles, generateRandomPosition()])
      }
    } else {
      newSnake.pop()
    }

    // Check power-up collision
    powerUps.forEach((powerUp, index) => {
      if (checkCollision(newHead, powerUp.position)) {
        const newPowerUps = [...powerUps]
        newPowerUps.splice(index, 1)
        setPowerUps(newPowerUps)

        switch (powerUp.type) {
          case 'speed':
            setSpeed(speed * SPEED_BOOST_MULTIPLIER)
            setTimeout(() => setSpeed(INITIAL_SPEED), 5000)
            break
          case 'multiply':
            setPointMultiplier(POINT_MULTIPLIER)
            setTimeout(() => setPointMultiplier(1), 5000)
            break
          case 'shield':
            setHasShield(true)
            setTimeout(() => setHasShield(false), 5000)
            break
        }
      }
    })

    setSnake(newSnake)
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP')
          break
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN')
          break
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT')
          break
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT')
          break
        case ' ':
          isPaused ? onResume() : onPause()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [direction, isPaused])

  useEffect(() => {
    if (isPaused) {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
      return
    }

    const gameLoop = (timestamp: number) => {
      if (timestamp - lastRenderTimeRef.current >= speed) {
        moveSnake()
        lastRenderTimeRef.current = timestamp
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [snake, direction, food, isPaused, speed])

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold">Score: {score}</div>
        <button
          onClick={isPaused ? onResume : onPause}
          className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
        >
          {isPaused ? <Play size={24} /> : <Pause size={24} />}
        </button>
      </div>

      <div 
        className="relative bg-gray-800 rounded-lg overflow-hidden"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE
        }}
      >
        {/* Snake */}
        <AnimatePresence>
          {snake.map((segment, index) => (
            <motion.div
              key={`${segment.x}-${segment.y}-${index}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={`absolute ${index === 0 ? 'bg-purple-500' : 'bg-purple-400'} rounded-sm`}
              style={{
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                left: segment.x * CELL_SIZE + 1,
                top: segment.y * CELL_SIZE + 1,
                boxShadow: hasShield && index === 0 ? '0 0 10px #9f7aea' : 'none'
              }}
            />
          ))}
        </AnimatePresence>

        {/* Food */}
        <motion.div
          className="absolute bg-green-500 rounded-full"
          style={{
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            left: food.x * CELL_SIZE + 2,
            top: food.y * CELL_SIZE + 2
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity
          }}
        />

        {/* Obstacles */}
        {obstacles.map((obstacle, index) => (
          <motion.div
            key={`obstacle-${index}`}
            className="absolute bg-red-500 rounded-sm"
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: obstacle.x * CELL_SIZE + 1,
              top: obstacle.y * CELL_SIZE + 1
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        ))}

        {/* Power-ups */}
        {powerUps.map((powerUp, index) => (
          <motion.div
            key={`powerup-${index}`}
            className={`absolute rounded-full ${
              powerUp.type === 'speed' ? 'bg-yellow-400' :
              powerUp.type === 'multiply' ? 'bg-blue-400' :
              'bg-purple-400'
            }`}
            style={{
              width: CELL_SIZE - 4,
              height: CELL_SIZE - 4,
              left: powerUp.position.x * CELL_SIZE + 2,
              top: powerUp.position.y * CELL_SIZE + 2
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity
            }}
          />
        ))}
      </div>

      {/* Status Effects */}
      <div className="flex gap-2 mt-4">
        {speed !== INITIAL_SPEED && (
          <div className="px-3 py-1 bg-yellow-500 rounded-full text-sm">Speed Boost</div>
        )}
        {pointMultiplier > 1 && (
          <div className="px-3 py-1 bg-blue-500 rounded-full text-sm">2x Points</div>
        )}
        {hasShield && (
          <div className="px-3 py-1 bg-purple-500 rounded-full text-sm">Shield</div>
        )}
      </div>
    </div>
  )
}