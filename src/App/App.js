import React, {Component} from 'react';
import {Route, Link} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import NoteListNav from '../NoteListNav/NoteListNav';
import NotePageNav from '../NotePageNav/NotePageNav';
import NoteListMain from '../NoteListMain/NoteListMain';
import NotePageMain from '../NotePageMain/NotePageMain';
import AddFolder from '../Add Folder/AddFolder';
import AddNote from '../Add Note/AddNote';
import ApiContext from '../ApiContext';
import config from '../config';
import './App.css';
import NotefulError from '../NotefulError/NotefulError';

class App extends Component {
    state = {
        notes: [],
        folders: []
    };

    componentDidMount() {
        Promise.all([
            fetch(`${config.API_ENDPOINT}/notes`),
            fetch(`${config.API_ENDPOINT}/folders`)
        ])
            .then(([notesRes, foldersRes]) => {
                if (!notesRes.ok)
                    return notesRes.json().then(e => Promise.reject(e));
                if (!foldersRes.ok)
                    return foldersRes.json().then(e => Promise.reject(e));

                return Promise.all([notesRes.json(), foldersRes.json()]);
            })
            .then(([notes, folders]) => {
                this.setState({notes, folders});
            })
            .catch(error => {
                console.error({error});
            });
    }

    handleDeleteNote = noteId => {
        this.setState({
            notes: this.state.notes.filter(note => note.id !== noteId)
        });
    };

    handleAddFolder = folder => {
      this.setState({
        folders: [...this.state.folders, folder],
      })
    }
  
    handleAddNote = note => {
      this.setState({
        notes: [...this.state.notes, note]
      })
    }

    renderNavRoutes() {
        return (
            <>
                {['/', '/folder/:folderId'].map(path => (
                    <Route
                        exact
                        key={path}
                        path={path}
                        component={NoteListNav}
                    />
                ))}
                <Route path="/note/:noteId" component={NotePageNav} />
                <Route path="/add-folder" component={NotePageNav} />
                <Route path="/add-note" component={NotePageNav} />
            </>
        );
    }

    renderMainRoutes() {
      return (
        <>
          {['/', '/folder/:folderId'].map(path => (
            <Route
              exact
              key={path}
              path={path}
              render={routeProps => {
                return <NoteListMain {...routeProps} />;
              }}
            />
          ))}
          <Route
            path='/note/:noteId'
            render={routeProps => {
              return <NotePageMain {...routeProps} />;
            }}
          />
          <Route path='/add-folder' component={AddFolder} />
          <Route path='/add-note' component={AddNote} />
        </>
      );
    }

    render() {
        const value = {
            notes: this.state.notes,
            folders: this.state.folders,
            deleteNote: this.handleDeleteNote,
            handleAddNote: this.handleAddNote,
            handleAddFolder: this.handleAddFolder
        };
        return (
            <ApiContext.Provider value={value}>
                <div className="App">
                    <nav className="App__nav">{this.renderNavRoutes()}</nav>
                    <header className="App__header">
                        <h1>
                            <Link to="/">Noteful</Link>{' '}
                            <FontAwesomeIcon icon="check-double" />
                        </h1>
                    </header>
                    <NotefulError>
                    <main className="App__main">{this.renderMainRoutes()}</main>
                    </NotefulError>
                </div>
            </ApiContext.Provider>
        );
    }
}

export default App;