import React, { useEffect, useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { FaDatabase, FaBrain, FaChartLine, FaGlobeAmericas } from 'react-icons/fa';
import '../styles/HomePage.css';

const HomePage = () => {
    const line1Keywords = [
        { word: 'Big Data', icon: FaDatabase },
        { word: 'NLP', icon: FaBrain },
        { word: 'Sentiment Analysis', icon: FaChartLine },
        { word: 'Geolocation', icon: FaGlobeAmericas },
    ];

    const [line1Sizes, setLine1Sizes] = useState({});

    const updateSizes = (keywords, setSizes) => {
        const newSizes = {};
        keywords.forEach(item => {
            newSizes[item.word] = `${Math.random() * 2 + 1}rem`;
        });
        setSizes(newSizes);
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            updateSizes(line1Keywords, setLine1Sizes);
        }, 2000);

        return () => {
            clearInterval(intervalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [props, set] = useSpring(() => ({ xy: [0, 0] }));

    const handleMouseMove = ({ clientX: x, clientY: y }) => set({ xy: [x - window.innerWidth / 2, y - window.innerHeight / 2] });

    return (
        <div className="home-container" onMouseMove={handleMouseMove}>
            <div className="title-container">
                <h1 className="main-title">Data Insights Dashboard</h1>
            </div>
            <div className="keywords-container">
                {line1Keywords.map(item => {
                    const IconComponent = item.icon;
                    return (
                        <animated.div key={item.word} style={{
                            fontSize: line1Sizes[item.word],
                            transform: props.xy.interpolate((x, y) => `translate3d(${x * 0.01}px,${y * 0.01}px,0)`)
                        }} className="keyword">
                            <IconComponent className="icon" /> {item.word} {}
                        </animated.div>
                    );
                })}
            </div>
        </div>
    );
};

export default HomePage;