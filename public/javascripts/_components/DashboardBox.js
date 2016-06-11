class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    // Operations usually carried out in componentWillMount go here
  }
  render() {
    return (
      <div className="asd">
        <button onClick={this.handleLoadMoreClick}>Load more</button>
      </div>
    );
  }
}

ReactDOM.render(
  <Dashboard />,
  document.getElementById('content')
);
