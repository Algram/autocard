import React from 'react';
import ReactDOM from 'react-dom';

export default class DashboardHeader extends React.Component {
  constructor(props) {
    super(props);
    // Operations usually carried out in componentWillMount go here
  }
  render() {
    return (
      <div className="col-md-10">
        <button onClick={this.handleLoadMoreClick}>Load more</button>
      </div>
    );
  }
}
