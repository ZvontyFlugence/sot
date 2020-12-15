import { useState } from 'react';
import ReactQuill from 'react-quill';
import moment from 'moment';

import { Button, Comment, Form, Header, Segment } from 'semantic-ui-react';
import 'react-quill/dist/quill.snow.css';

export default function ArticleBody({ article }) {
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {}

  return article && (
    <>
      <Segment>
        <ReactQuill
          theme='bubble'
          value={article.content}
          readOnly={true}
        />
      </Segment>
      <Segment>
          <Comment.Group>
            <Header as='h3' dividing>
              Comments
            </Header>

            <Form reply>
              <Form.TextArea value={replyText} onChange={(_, {value}) => setReplyText(value)} />
              <Button content='Add Reply' labelPosition='left' icon='edit' primary />
            </Form>

            {
              article.comments && article.comments.map((comment) => (
                <Comment key={comment.id}>
                  <Comment.Avatar src={comment.from.image} />
                  <Comment.Content>
                    <Comment.Author as='a'>{ comment.from.displayName }</Comment.Author>
                    <Comment.Metadata>
                      <div>{ moment(comment.timestamp).fromNow() }</div>
                    </Comment.Metadata>
                    <Comment.Text>{ comment.text }</Comment.Text>
                  </Comment.Content>
                </Comment>
              ))
            }
          </Comment.Group>
      </Segment>
    </>
  );
}