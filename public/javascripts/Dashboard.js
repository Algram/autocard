import React from 'react';
import ReactDOM from 'react-dom';

import DashboardHeader from './_components/DashboardHeader';
import DashboardHeader from './_components/DashboardForm';
import DashboardHeader from './_components/DashboardTable';
import DashboardHeader from './_components/DashboardTile';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    // Operations usually carried out in componentWillMount go here
  }
  componentDidMount() {
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
