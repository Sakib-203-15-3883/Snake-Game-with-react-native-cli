import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import BannerAds from './Ads/Banner';

const CELL_SIZE = 25;
const BOARD_SIZE = Dimensions.get('window').width;
const BOARD_HEIGHT = Dimensions.get('window').height * 0.5;
const snakeImage = "𓆨" ; 
const FRUITS = [
  { emoji: '🍎', value: 1 },
  { emoji: '🍌', value: 2 },
  { emoji: '🍓', value: 3 },
  { emoji: '🍉', value: 4 },
  { emoji: '🍇', value: 5 },
];

const getRandomPosition = () => {
  const maxPos = Math.floor(BOARD_SIZE / CELL_SIZE);
  const x = Math.floor(Math.random() * maxPos) * CELL_SIZE;
  const y = Math.floor(Math.random() * maxPos) * CELL_SIZE;
  return { x, y };
};

const getRandomFruit = () => {
  const randomIndex = Math.floor(Math.random() * FRUITS.length);
  return FRUITS[randomIndex];
};

const generateMultipleFruits = (count) => {
  const fruits = [];
  for (let i = 0; i < count; i++) {
    fruits.push({ position: getRandomPosition(), ...getRandomFruit() });
  }
  return fruits;
};

const App = () => {
  const [snake, setSnake] = useState([{ x: 0, y: 0 }]);
  const [foods, setFoods] = useState(generateMultipleFruits(5));
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const loadHighScore = async () => {
      const savedHighScore = await AsyncStorage.getItem('highScore');
      if (savedHighScore !== null) {
        setHighScore(parseInt(savedHighScore, 10));
      }
    };
    loadHighScore();
  }, []);

  useEffect(() => {
    const newLevel = Math.floor(score / 20) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
    }
  }, [score, level]);
  

  const moveSnake = () => {
    const snakeCopy = [...snake];
    const head = { ...snakeCopy[0] };
    head.x += direction.x * CELL_SIZE;
    head.y += direction.y * CELL_SIZE;

    if (
      head.x < 0 || 
      head.x >= BOARD_SIZE || 
      head.y < 0 || 
      head.y >= BOARD_SIZE || 
      snakeCopy.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
      setGameOver(true);
      return;
    }

    snakeCopy.unshift(head);

    // Check for food collision
    const eatenFood = foods.find(food => head.x === food.position.x && head.y === food.position.y);
    if (eatenFood) {
      setFoods(generateMultipleFruits(5));
      setScore(score + eatenFood.value);
    } else {
      snakeCopy.pop();
    }

    setSnake(snakeCopy);
  };

  useInterval(moveSnake, gameOver ? null : 300);

  const changeDirection = (newDirection) => {
    if (Math.abs(direction.x) !== Math.abs(newDirection.x) || Math.abs(direction.y) !== Math.abs(newDirection.y)) {
      setDirection(newDirection);
    }
  };

  const resetGame = async () => {
    if (score > highScore) {
      setHighScore(score);
      await AsyncStorage.setItem('highScore', (score + '').toString());
    }

    setSnake([{ x: 0, y: 0 }]);
    setFoods(generateMultipleFruits(5));
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setLevel(1); // Reset level to 1
  };

  return (
    <SafeAreaProvider> 
      <SafeAreaView style={styles.container}>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.highScore}>Highest Score: {highScore}</Text>
        <Text style={styles.level}>Level: {level}</Text>
        <View style={styles.board}>
          {snake.map((segment, index) => (
            <Text key={index} style={[
              styles.snake,
              { left: segment.x, top: segment.y },
              index === 0 ? styles.snakeHead : styles.snakeBody
            ]}>
              {index === 0 ? '🐸' : snakeImage}
            </Text>
          ))}
          {foods.map((food, index) => (
            <Text key={index} style={[styles.food, { left: food.position.x, top: food.position.y }]}>
              {food.emoji} {food.value}
            </Text>
          ))}
        </View>
        <View style={styles.controls}>
          <TouchableOpacity onPress={() => changeDirection({ x: 0, y: -1 })} style={styles.controlButton}>
            <Icon name="arrow-up" size={30} color="#fff" />
          </TouchableOpacity>
          <View style={styles.horizontalControls}>
            <TouchableOpacity onPress={() => changeDirection({ x: -1, y: 0 })} style={styles.controlButton}>
              <Icon name="arrow-left" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeDirection({ x: 1, y: 0 })} style={styles.controlButton}>
              <Icon name="arrow-right" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => changeDirection({ x: 0, y: 1 })} style={styles.controlButton}>
            <Icon name="arrow-down" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
        {gameOver && (
          <View style={styles.gameOver}>
            <Text style={styles.gameOverText}>Game Over</Text>
            <Text style={styles.finalScore}>Final Score: {score}</Text>
            <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Restart</Text>
            </TouchableOpacity>
          </View>
        )}



        {/* <BannerAds/> */}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  score: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  highScore: {
    color: '#ff0',
    fontSize: 14,
    marginBottom: 5,
  },
  level: {
    color: '#0f0',
    fontSize: 14,
    marginBottom: 5,
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_HEIGHT,
    backgroundColor: '#04222E',
    position: 'relative',
  },
  snake: {
    position: 'absolute',
    fontSize: CELL_SIZE,
  },
  snakeBody: {},
  snakeHead: {
    fontWeight: 'bold',
  },
  food: {
    position: 'absolute',
    fontSize: CELL_SIZE,
  },
  controls: {
    flexDirection: 'column',
    marginTop: '5%',
    marginBottom: '15%',
    alignItems: 'center',
  },
  horizontalControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginVertical: 10,
  },
  controlButton: {
    width: 50,
    height: 50,
    backgroundColor: '#4A4A4A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  gameOver: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  gameOverText: {
    color: '#fff',
    fontSize: 32,
    marginBottom: 20,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
  finalScore: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  resetButton: {
    padding: 15,
    backgroundColor: '#FF6347',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default App;
