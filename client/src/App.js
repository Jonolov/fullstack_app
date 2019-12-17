/* eslint-disable no-underscore-dangle */
import React, { Component } from 'react'
import axios from 'axios'
import './App.scss'

class App extends Component {
  // initialize our state
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      message: null,
      intervalIsSet: false,
      idToDelete: null,
      idToUpdate: null,
      updateToApply: null
    }
  }

  // when component mounts, first thing it does is fetch all existing data in our db
  // then we incorporate a polling logic so that we can easily see if our db has
  // changed and implement those changes into our UI
  componentDidMount() {
    const { intervalIsSet } = this.state
    this.getDataFromDb()
    if (!intervalIsSet) {
      const interval = setInterval(this.getDataFromDb, 1000)
      this.setState({ intervalIsSet: interval })
    }
  }

  // never let a process live forever
  // always kill a process everytime we are done using it
  componentWillUnmount() {
    const { intervalIsSet } = this.state
    if (intervalIsSet) {
      clearInterval(intervalIsSet)
      this.setState({ intervalIsSet: null })
    }
  }

  // just a note, here, in the front end, we use the id key of our data object
  // in order to identify which we want to Update or delete.
  // for our back end, we use the object id assigned by MongoDB to modify
  // data base entries

  // our first get method that uses our backend api to
  // fetch data from our data base
  getDataFromDb = () => {
    fetch('/api/getData', {
      accept: 'application/json'
    })
      .then(data => data.json())
      .then(res => this.setState({ data: res.data }))
  }

  // our put method that uses our backend api
  // to create new query into our data base
  putDataToDB = message => {
    const { data } = this.state
    const currentIds = data.map(item => item.id)
    let idToBeAdded = 0
    while (currentIds.includes(idToBeAdded)) {
      idToBeAdded += 1
    }

    axios.post('/api/putData', {
      id: idToBeAdded,
      message
    })
  }

  // our delete method that uses our backend api
  // to remove existing database information
  deleteFromDB = idTodelete => {
    const deleteId = parseInt(idTodelete, 10)
    const { data } = this.state

    const objIdToDelete = data.map(dat => {
      if (dat.id === deleteId) {
        return dat._id
      }
      return null
    })
    axios.delete('/api/deleteData', {
      data: {
        id: objIdToDelete
      }
    })
  }

  // our update method that uses our backend api
  // to overwrite existing data base information
  updateDB = (idToUpdate, updateToApply) => {
    // let objIdToUpdate = null
    const updateId = parseInt(idToUpdate, 10)
    const { data } = this.state

    const objIdToUpdate = data.map(dat => {
      if (dat.id === updateId) {
        return dat._id
      }
      return null
    })

    axios.post('/api/updateData', {
      id: objIdToUpdate,
      update: { message: updateToApply }
    })
  }

  // here is our UI
  // it is easy to understand their functions when you
  // see them render into our screen
  render() {
    const { data, message, idToDelete, idToUpdate, updateToApply } = this.state
    return (
      <div className="App">
        <ul>
          {data.length <= 0
            ? 'NO DB ENTRIES YET'
            : data.map(dat => (
                <li style={{ padding: '10px' }} key={dat.id}>
                  <span style={{ color: 'gray' }}> id: </span> {dat.id} <br />
                  <span style={{ color: 'gray' }}> data: </span>
                  {dat.message}
                </li>
              ))}
        </ul>
        <div style={{ padding: '10px' }}>
          <input
            type="text"
            onChange={e => this.setState({ message: e.target.value })}
            placeholder="add something in the database"
            style={{ width: '200px' }}
          />
          <button type="button" onClick={() => this.putDataToDB(message)}>
            ADD
          </button>
        </div>
        <div style={{ padding: '10px' }}>
          <input
            type="text"
            style={{ width: '200px' }}
            onChange={e => this.setState({ idToDelete: e.target.value })}
            placeholder="put id of item to delete here"
          />
          <button type="button" onClick={() => this.deleteFromDB(idToDelete)}>
            DELETE
          </button>
        </div>
        <div style={{ padding: '10px' }}>
          <input
            type="text"
            style={{ width: '200px' }}
            onChange={e => this.setState({ idToUpdate: e.target.value })}
            placeholder="id of item to update here"
          />
          <input
            type="text"
            style={{ width: '200px' }}
            onChange={e => this.setState({ updateToApply: e.target.value })}
            placeholder="put new value of the item here"
          />
          <button type="button" onClick={() => this.updateDB(idToUpdate, updateToApply)}>
            UPDATE
          </button>
        </div>
      </div>
    )
  }
}

export default App
