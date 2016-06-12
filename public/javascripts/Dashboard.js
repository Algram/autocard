import React from 'react';
import ReactDOM from 'react-dom';

import DashboardHeader from './_components/DashboardHeader';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    // Operations usually carried out in componentWillMount go here
  }
  render() {
    return (
      <DashboardHeader />
    );
  }
}

ReactDOM.render(
  <Dashboard />,
  document.getElementById('content')
);
