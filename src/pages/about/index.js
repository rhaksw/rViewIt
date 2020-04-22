import React from 'react'
import { connect } from 'state'
import BlankUser from 'components/BlankUser'
import Comment from 'pages/common/Comment'
import Time from 'pages/common/Time'
import { getComments } from 'api/reddit'
import { getCommentsByID as getPushshiftComments } from 'api/pushshift'
import { itemIsRemovedOrDeleted, SimpleURLSearchParams } from 'utils'
import { combinePushshiftAndRedditComments } from 'data_processing/comments'
import Highlight from 'pages/common/Highlight'
import { Link } from 'react-router-dom'

const reddit = 'https://www.reddit.com'

const say = [
  'eq7b6sh', 'eq96jfe', 'eqhix9c', 'eq3x4jv', 'eqrjqha', 'eqxphke', 'eq73d6e',
  'eg5kla2', 'eg58nc9', 'eg4u1rr', 'eg4tkcu', 'eg4szw5', 'eg4mxqb', 'eg4cech',
  'eg3ueep', 'eg3bgki', 'eg33rjm', 'eg33ki6', 'eg30s12', 'eg300eo', 'eg2zjb9',
  'eg2xgjc', 'eg2x1kt', 'eg2vm27', 'eg2vamc', 'eg2ugkf', 'eg2ub8f', 'eg2t4zp',
  'eg2s3gf', 'eg2pxd8', 'eg2pa9c', 'eg2oymq', 'eg2nqjz', 'eg2ksrf', 'eg2jrvb',
  'eg2hdg2', 'eg2giv2', 'esloe21', 'f2a8nug', 'f2ap7p3', 'f3uj76k', 'f3ul663',
  'f8wrtrj', 'f93p3zu', 'ff1nzne', 'fim3oud', 'fiv7ew1', 'fnw0gxd'
]

const filterDeletedComments = (comments) => {
  const result = []
  Object.entries(comments).forEach(([id, c]) => {
    c.link_title = ''
    if (! itemIsRemovedOrDeleted(c) && (! c.edited || c.edited < 1587526971)) {
      result.push(c)
    }
  })
  return result
}

export class About extends React.Component {
  state = {
    comments: [],
    singleDisplayIndex: 0
  }
  changeView = (index) => {
    this.setState({singleDisplayIndex: index})
  }
  donate = () => {
    this.props.openGenericModal({hash:'donate'})
  }
  componentDidMount() {
    const ps = getPushshiftComments(say)
    getComments(
      {ids: say.sort(() => 0.5 - Math.random())})
    .then(redditComments => {
      this.setState({comments: filterDeletedComments(redditComments)})
      ps.then(pushshiftComments => {
        const combined = combinePushshiftAndRedditComments(pushshiftComments, redditComments, false)
        this.setState({comments: filterDeletedComments(combined)})
      })
    })
  }
  render() {
    const props = this.props
    document.title = 'About reveddit'
    if (props.global.state.statusImage !== undefined) {
      props.global.clearStatus()
    }
    let singleDisplayComment = null
    let hasNext = false, hasPrev = false
    let nextAttr = {}, prevAttr = {}
    if (this.state.singleDisplayIndex >= 0) {
      singleDisplayComment = this.state.comments[this.state.singleDisplayIndex]
      if (this.state.singleDisplayIndex > 0) {
        hasPrev = true
        prevAttr = {onClick: (e) => this.changeView(this.state.singleDisplayIndex-1)}
      }
      if (this.state.singleDisplayIndex < this.state.comments.length-1) {
        hasNext = true
        nextAttr = {onClick: (e) => this.changeView(this.state.singleDisplayIndex+1)}
      }
    }
    const status = new SimpleURLSearchParams(window.location.search).get('status') || ''
    let message = ''
    if (status === 'donate-success') {
      message = 'Thank you for your donation!'
    } else if (status === 'donate-cancel') {
      message = 'Your donation has been cancelled.'
    }
    return (
      <div id='main'>
        <div id='main-box'>
          <div className='about section'>
            {message &&
              <div className='message'>
                {message}
              </div>
            }
            <h2 className='about'>About</h2>
            <BlankUser/>
            <Highlight/>
          </div>
          <div className='section'>
            <h2 className='about'>What people say</h2>
            {this.state.comments.length ?
              singleDisplayComment ?
                <React.Fragment>
                  <div className='non-item'>
                    <a  {...prevAttr}
                       className={`collapseToggle prev ${hasPrev ? 'active':'disabled'}`}>&lt;- previous</a>
                    <a {...nextAttr}
                            className={`collapseToggle next ${hasNext ? 'active':'disabled'}`}>next -&gt;</a>
                  </div>
                  <Comment key={singleDisplayComment.id} {...singleDisplayComment}/>
                  <div className='non-item'><a onClick={(e) => this.changeView(-1)}
                          className='collapseToggle'>[+] view all</a>
                  </div>
                </React.Fragment>
                :
                <React.Fragment>
                  <div className='non-item'><a onClick={(e) => this.changeView(0)}
                          className='collapseToggle'>[–] show less</a>
                  </div>
                  {this.state.comments.map(c => <Comment key={c.id} {...c}/>)}
                  <div className='non-item'><a onClick={(e) => this.changeView(0)}
                          className='collapseToggle'>[–] show less</a>
                  </div>
                </React.Fragment>
            : ''}
          </div>
          <div className='sections'>
            <div className='section half'>
              <h2 className='about'>News</h2>
              <ul className='news'>
                <li><a href={`${reddit}/estw67/`}>random user, collapsed comments, xposts</a>
                  <ul><li><Time created_utc='1579789966'/></li></ul></li>
                <li><Link to="/add-ons/">real-time notifier extension</Link>
                  <ul><li><Time created_utc='1576163308'/></li></ul></li>
                <li><a href={`${reddit}/e1wsqy/`}>revddit.com -> www.reveddit.com</a>
                  <ul><li><Time created_utc='1574768321'/></li></ul></li>
                <li><a href={`${reddit}/db5hfm/`}>tip: /y and /v aliases for /user and /r</a>
                  <ul><li><Time created_utc='1569812523'/></li></ul></li>
                <li><a href={`${reddit}/r/shortcuts/comments/ct64s6/is_it_possible_to_modify_a_copied_link/exkas2j/?context=3`}>reveddit shortcut for iOS</a>
                  <ul><li><Time created_utc='1566381957'/></li></ul></li>
                <li><a href={`${reddit}/clwnxg/`}>reveddit linker extension</a>
                  <ul><li><Time created_utc='1564927561'/></li></ul></li>
                <li><a href={`${reddit}/9n9l45/`}>site launch</a>
                  <ul><li><Time created_utc='1539261445'/></li></ul></li>
              </ul>
            </div>
            <div className='section half'>
              <h2 className='about'>Site usage</h2>
              <p>Insert <span className='v'>ve</span> into the URL of any reddit page.</p>
                <ul>
                  <li><a href='/user/redditor_3975/'>user/redditor_3975</a></li>
                  <li><a href='/r/all/'>r/all</a></li>
                  <li><a href='/r/cant_say_goodbye/'>r/cant_say_goodbye</a></li>
                  <li><a href='/r/cant_say_goodbye/comments'>r/.../comments</a></li>
                  <li><a href='/r/cant_say_goodbye/comments/9ffoqz/comments_mentioning_goodbye_are_removed/'>r/.../comments/9ffoqz/</a></li>
                  <li><a href='/domain/cnn.com+edition.cnn.com'>domain/cnn.com+ edition.cnn.com</a></li>
                  <li><a href='/r/news+worldnews/'>r/news+worldnews/</a></li>
                  <li><a href='/r/worldnews/duplicates/eb2hjw'>other-discussions+</a></li>
                </ul>
            </div>
          </div>
          <div className='sections'>
            <div className='section half'>
              <h2 className='about'>Feedback</h2>
              <ul>
                <li><a href='https://www.reddit.com/r/reveddit/'>/r/reveddit</a></li>
                <li><a href='https://github.com/reveddit/reveddit'>github.com/reveddit/reveddit</a></li>
              </ul>
            </div>
            <div className='section half'>
              <h2 className='about'>Credits</h2>
              <p>
                Created by
                <a href='https://github.com/rhaksw/'> Rob Hawkins</a> using:</p>
                  <ul>
                    <li><a href='https://github.com/JubbeArt/removeddit'> Removeddit</a> by Jesper Wrang</li>
                    <li><a href='https://www.reddit.com/r/pushshift/'>Pushshift</a> by Jason Baumgartner</li>
                  </ul>
            </div>
          </div>
          <div className='sections'>
            <div className='section half'>
              <h2 className='about'>Donate</h2>
              <p>re(ve)ddit is free and ad-free. You can support work like this with a <a className="pointer" onClick={this.donate}>donation</a>, feedback, or code fixes.</p>
              <p>Thank you!</p>
            </div>
            <div className='section half'>
              <h2 className='about'>Credo</h2>
              <p>Secretly removing content is within reddit's free speech rights, and so is revealing said removals.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(About)
