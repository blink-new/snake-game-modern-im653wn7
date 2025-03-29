
import { useState } from 'react'
import { Game } from './components/Game'
import { Menu } from './components/Menu'
import './App.css'

function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore')
    return saved ? parseInt(saved) : 0
  })

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore)
    if (finalScore > highScore) {
      setHighScore(finalScore)
      localStorage.setItem('snakeHighScore', finalScore.toString())
    }
    setGameState('gameover')
  }

  const startGame = () => {
    setScore(0)
    setGameState('playing')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {gameState === 'menu' && (
          <Menu onStart={startGame} highScore={highScore} />
        )}
        {(gameState === 'playing' || gameState === 'paused') && (
          <Game 
            onGameOver={handleGameOver}
            isPaused={gameState === 'paused'}
            onPause={() => setGameState('paused')}
            onResume={() => setGameState('playing')}
            score={score}
            setScore={setScore}
          />
        )}
        {gameState === 'gameover' && (
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Game Over</h2>
            <p className="text-2xl mb-4">Score: {score}</p>
            <p className="text-xl mb-8">High Score: {highScore}</p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-xl font-semibold transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App