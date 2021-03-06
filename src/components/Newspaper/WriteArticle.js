import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import ReactQuill from 'react-quill';

import { useGetUser } from '../../context/UserContext';
import { useSetNotification } from '../../context/NotificationContext';
import SoTApi from '../../services/SoTApi';

import { Button, Form, Segment } from 'semantic-ui-react';

import 'react-quill/dist/quill.snow.css';

const EMPTY_DELTA = { ops: [] };

export default function WriteArticle(props) {
  const id = props.match.params.id;
  const history = useHistory();
  const user = useGetUser();
  const setNotification = useSetNotification();
  const [editorValue, setEditorValue] = useState(EMPTY_DELTA);
  const [articleName, setArticleName] = useState('');

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline','strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  const handleNameChange = (e, _data) => {
    setArticleName(e.target.value);
  }

  const handleEditorChange = (_value, _delta, _source, editor) => {
    setEditorValue(editor.getContents())
  }

  const handlePublish = () => {
    let payload = {
      action: 'publish_article',
      article: {
        title: articleName,
        content: editorValue,
        country: user && user.country,
        published: true,
        publishDate: new Date(Date.now()),
      },
    };

    SoTApi.doNewsAction(id, payload).then(data => {
      if (data.success) {
        // display success notification
        setNotification({ type: 'success', header: 'Article Published' });
        // go to article page
        history.push(`/newspaper/${id}/article/${data.articleId}`);
      }
    })
    .catch(err => {
      // display error notification
    });
  }

  const handleSave = () => {
    let payload = {
      action: 'save_article',
      article: {
        title: articleName,
        content: editorValue,
        published: false,
      },
    };

    SoTApi.doNewsAction(id, payload).then(data => {
      if (data.success) {
        // display success notification
        setNotification({ type: 'success', header: 'Article Saved' });
        // go back to newspaper home
        history.push(`/newspaper/${id}`);
      }
    })
    .catch(err => {
      // display error notification
    });
  }

  return (
      <div id='create-article'>
        <Segment style={{ height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Write Article</h1>
            <div>
              <Button compact color='blue' content='Publish' onClick={handlePublish} />
              <Button compact color='green' content='Save' onClick={handleSave} />
            </div>
          </div>
          <div>
            <Form>
              <Form.Input
                fluid
                type='text'
                label='Article Name'
                value={articleName}
                onChange={handleNameChange}
              />
            </Form>
          </div>
          <div style={{ marginTop: '10px' }}>
            <ReactQuill
              theme='snow'
              modules={modules}
              formats={formats}
              value={editorValue}
              onChange={handleEditorChange}
            />
          </div>          
        </Segment>
      </div>
  )
}