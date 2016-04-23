var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');

// comment box
var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data['comments']});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    var newComments = comments.concat([comment]);

    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: { comment: comment },
      success: function(data) {
        this.setState({data: data['comments']});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
      <div className="commentBox panel panel-info">
        <div className="panel-heading">
          <h1 className="panel-title">Comments</h1>
        </div>
        <div className="panel-body">
          <CommentList comments={this.state.data} />
          <CommentForm onCommentSubmit={this.handleCommentSubmit} />
        </div>
     </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    // build comment nodes by looping through props.comments, which was pass in from commentBox
    var commentNodes = this.props.comments.map(function(comment) {
      return (
        <Comment author={comment.author} key={comment.id}>
          {comment.content}
        </Comment>
      );
    });

    return (
      <div className="commentList">
        {/*fetch comment nodes that we built above*/}
        {commentNodes}
      </div>
    );
  }
});

var Comment = React.createClass({
  render: function() {
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        {this.props.children}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {athuor: '', content: ''};
  },
  handleAuthorChange: function(e) {
    return this.setState({author: e.target.value});
  },
  handleContentChange: function(e) {
    return this.setState({content: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var content = this.state.content.trim();
    if (!content || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, content: content})
    this.setState({author: '', content: ''});
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <div className="form-group">
          <input className="form-control"
            type="text" placeholder="Your name"
            value={this.state.author} onChange={this.handleAuthorChange}
          />
        </div>
        <div className="form-group">
          <textarea className="form-control"
            type="text" placeholder="Say something..."
            value={this.state.content} onChange={this.handleContentChange}
          />
        </div>
        <input type="submit" value="Post" className="btn btn-info pull-right" />
      </form>
    );
  }
});

ReactDOM.render(<CommentBox url='http://localhost:3005/api/v1/comments'  pollInterval={2000} />, document.querySelector('#content'));
