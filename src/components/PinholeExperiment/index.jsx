import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const ExperimentContainer = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  background-color: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
`;

const SVGCanvas = styled.svg`
  width: 100%;
  height: 100%;
`;

const LightSource = styled.g`
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
`;

const Pinhole = styled.circle`
  fill: #ffffff;
`;

const ScreenCenter = styled.circle`
  fill: #ffffff;
`;

const Screen = styled.path`
  fill: #333333;
  stroke: #444444;
  stroke-width: 2;
`;

const PinholeExperiment = () => {
  const containerRef = useRef(null);
  const [sourcePosition, setSourcePosition] = useState({ x: 100, y: 250 });
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const PINHOLE_X = 400;
  const PINHOLE_Y = 250;
  const SCREEN_X = 700;
  const SCREEN_Y = 250;
  const F_HEIGHT = 100;
  const F_WIDTH = 40;
  const BARRIER_WIDTH = 60;
  const BARRIER_HEIGHT = 200;

  // 计算目标点Y坐标
  const calculateDestY = (sourceY, sourceX) => {
    return SCREEN_Y + (PINHOLE_Y - sourceY) * (SCREEN_X - PINHOLE_X)/(PINHOLE_X - sourceX);
  };

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const svgRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;

    // 限制光源移动范围
    const newX = Math.max(50, Math.min(x, PINHOLE_X - 50));
    const newY = Math.max(F_HEIGHT, Math.min(y, 500 - F_HEIGHT));

    setSourcePosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };


  const getLightRays = () => {
    // F形状的关键点
    const points = [
      { x: sourcePosition.x, y: sourcePosition.y - F_HEIGHT },
      { x: sourcePosition.x + F_WIDTH, y: sourcePosition.y - F_HEIGHT -F_WIDTH/2},
      { x: sourcePosition.x, y: sourcePosition.y },
      { x: sourcePosition.x, y: sourcePosition.y - F_HEIGHT/2 },
      { x: sourcePosition.x + F_WIDTH, y: sourcePosition.y - F_HEIGHT/2 -F_WIDTH/2 }
    ];

		const currentDestY = calculateDestY(sourcePosition.y, sourcePosition.x);
		const currentDestY2 = calculateDestY(sourcePosition.y - F_HEIGHT, sourcePosition.x)
		const currentDestMiddle = calculateDestY(sourcePosition.y - F_HEIGHT/2, sourcePosition.x)

		const F_HEIGHT_NEW = currentDestY2 - currentDestY;
		const F_HEIGHT_HALF = currentDestMiddle - currentDestY;
		const F_WIDTH_NEW = F_WIDTH * (F_HEIGHT_NEW / F_HEIGHT);

		const pathData = `M0,${F_HEIGHT_NEW} L${-F_WIDTH_NEW},${F_HEIGHT_NEW+F_WIDTH_NEW/2} M0,${F_HEIGHT_NEW} V0 M0,${F_HEIGHT_HALF} L${-F_WIDTH_NEW},${F_HEIGHT_HALF+F_WIDTH_NEW/2}`;


    return points.map((point, index) => {
      
      // 计算到小孔和屏幕的距离
      const distanceToScreen = SCREEN_X - PINHOLE_X;
			const distanceToPinhole = PINHOLE_X- point.x;
      
      // 计算投影比例
      const ratio = distanceToScreen/distanceToPinhole;
      
      // 计算在屏幕上的投影位置
      var screenY = SCREEN_Y + (PINHOLE_Y - point.y) *ratio;
			var screenX = SCREEN_X;

			if (index == 1) {
				screenX = 700-F_WIDTH_NEW;
				screenY = currentDestY+F_HEIGHT_NEW+F_WIDTH_NEW/2;
			}

			if (index == 4) {
				screenX = 700-F_WIDTH_NEW;
				screenY = currentDestY+F_HEIGHT_HALF+F_WIDTH_NEW/2;
			}
      
      return (
				<>
					<line
          key={index}
          x1={point.x}
          y1={point.y}
          x2={screenX}
          y2={screenY}
          stroke="#FFD700"
          strokeWidth="1"
          opacity="0.6"
        	/>
					<LightSource
          transform={`translate(700,${currentDestY})`}
        >
          <path
            d={pathData}
            stroke="#ffffff"
            strokeWidth="4"
            fill="none"
          />
        </LightSource>
				</>
      );
    });
  };

  return (
    <ExperimentContainer
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <SVGCanvas viewBox="0 0 800 500">
        {/* 遮光板 */}
        <path
          d={`M${PINHOLE_X - BARRIER_WIDTH/2},${PINHOLE_Y - BARRIER_HEIGHT/2+ BARRIER_WIDTH/2} 
              L${PINHOLE_X + BARRIER_WIDTH/2},${PINHOLE_Y - BARRIER_HEIGHT/2 }
              L${PINHOLE_X + BARRIER_WIDTH/2},${PINHOLE_Y + BARRIER_HEIGHT/2- BARRIER_WIDTH/2}
              L${PINHOLE_X - BARRIER_WIDTH/2},${PINHOLE_Y + BARRIER_HEIGHT/2 }Z`}
          fill="#333333"
          stroke="#444444"
          strokeWidth="2"
        />

        {/* F形光源 */}
        <LightSource
          onMouseDown={handleMouseDown}
          transform={`translate(${sourcePosition.x},${sourcePosition.y})`}
        >
          <path
            d="M0,-100 L40,-120 M0,-100 V0 M0,-50 L40,-70"
            stroke="#ffffff"
            strokeWidth="4"
            fill="none"
          />
        </LightSource>

        {/* 小孔 */}
        <Pinhole cx={PINHOLE_X} cy={PINHOLE_Y} r={3} />

				

        {/* 光屏中心 */}
        <ScreenCenter cx={SCREEN_X} cy={SCREEN_Y} r={1} />
        
        

				{/* 光屏 */}
        <Screen 
          d={`M${SCREEN_X - 100 },${50 + 140/2}
              L${SCREEN_X + 40},${50}
              L${SCREEN_X + 40},${450 - 140/2}
              L${SCREEN_X - 100},${450}Z`}
        />
				{/* 光线 */}
        {getLightRays()}


				
      </SVGCanvas>
    </ExperimentContainer>
  );
};

export default PinholeExperiment;
