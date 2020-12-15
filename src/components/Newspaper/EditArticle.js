import { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import ReactQuill from 'react-quill';

import { useSetNotification } from '../../context/NotificationContext';
import SoTApi from '../../services/SoTApi';

import { Button, Form, Segment } from 'semantic-ui-react';

import 'react-quill/dist/quill.snow.css';

export default function EditArticle() {
  const { newsId, articleId } = useParams();
  const history = useHistory();
  const setNotification = useSetNotification();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    if (!article) {
      SoTApi.getArticle(newsId, articleId).then(data => {
        if (data.article) {
          setArticle(article);
        }
      });
    }
  }, []);

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

  const handleNameChange = (_, { value }) => {
    setArticle(prev => ({ ...prev, title: value }));
  }

  const handleEditorChange = (_, _delta, _source, editor) => {
    // setEditorValue(editor.getContents())
    setArticle(prev => ({ ...prev, content: editor.getContents() }));
  }

  const handlePublish = () => {
    let payload = {
      action: 'publish_draft',
      article: {
        ...article,
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
      action: 'save_draft',
      article,
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

  return article && (
      <div id='edit-article'>
        <Segment>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Edit Article</h1>
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
                value={article.title}
                onChange={handleNameChange}
              />
            </Form>
          </div>
          <div style={{ marginTop: '10px' }}>
            <ReactQuill
              theme='snow'
              modules={modules}
              formats={formats}
              value={article.content}
              style={{ height: '55vh', overflowY: 'auto' }}
              onChange={handleEditorChange}
            />
          </div>          
        </Segment>
      </div>
  )
}