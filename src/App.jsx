import React from 'react';
import PinholeExperiment from './components/PinholeExperiment';

const App = () => {
  return (
    <div className="container">
      <h1 className="title">小孔成像实验演示</h1>
      <p className="instructions">
        拖动左侧的F形光源来观察小孔成像的变化。光线经过小孔后在右侧光屏上形成倒立的实像。
      </p>
      <PinholeExperiment />
    </div>
  );
};

export default App;
