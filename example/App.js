import React from 'react';
import { StyleSheet, Text, TextInput, View, Button, AsyncStorage } from 'react-native';
import AsyncStorageREPL from './src/rn/AsyncStorageREPL';

AsyncStorageREPL().connect();

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { inputText: '', comments: [] };
    this._handlePost = this.handlePost.bind(this);
  }

  componentDidMount() {
    AsyncStorage.getItem('comments', (_err, result) => {
      this.setState({ comments: JSON.parse(result) || [] });
    });
  }

  handlePost() {
    const comments = this.state.comments.concat(this.state.inputText);
    AsyncStorage.setItem('comments', JSON.stringify(comments), (_err) => {
      this.setState({ comments, inputText: '' });
    });
  }

  render() {
    const comments = this.state.comments.map((comment, idx) =>
      <Text key={idx} style={styles.comment}>{comment}</Text>);
    return (
      <View style={styles.container}>
        <View style={styles.postArea}>
          <View>
            <TextInput
              style={styles.input}
              value={this.state.inputText}
              onChangeText={(text) => { this.setState({ inputText: text }); }}
            />
          </View>
          <Button onPress={this._handlePost} title="POST" />
        </View>
        <View style={styles.commentArea}>
          <Text style={styles.title}>Comments</Text>
          {comments}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 60,
    marginHorizontal: 20,
    flex: 1,
  },
  input: {
    padding: 8,
    width: 300,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
  },
  postArea: {
    marginBottom: 16,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  commentArea: {
    flex: 5,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
  },
  comment: {
    margin: 8,
  },
});
