import React from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import Post from 'pages/common/Post'
import Comment from 'pages/common/Comment'
import LoadLink from './LoadLink'
import Selections from 'pages/common/selections'
import scrollToElement from 'scroll-to-element'
import { connect, removedFilter_types } from 'state'
import Time from 'pages/common/Time'
import { withFetch } from 'pages/RevdditFetcher'
import { getQueryParams } from 'data_processing/user'

class User extends React.Component {
  render () {
    const { user, kind = ''} = this.props.match.params
    const { page_type, viewableItems, selections, getRevdditUserItems } = this.props
    const qp = getQueryParams()
    const gs = this.props.global.state
    let loadAllLink = ''
    let nextLink = ''
    let lastTimeLoaded = ''
    const showAllSubreddits = gs.categoryFilter_subreddit === 'all'
    let totalPages = 10
    if (! gs.userNext) {
      totalPages = gs.num_pages
    }

    if (! gs.loading) {
      if (! qp.after && gs.userNext) {
        loadAllLink = <LoadLink user={user}
                       getRevdditUserItems={getRevdditUserItems}
                       kind={kind}
                       show={qp.show}
                       loadAll={true}/>
      }
    }
    if (gs.loading) {
      nextLink = <div className='non-item'><img className='spin' src='/images/spin.gif'/></div>
    } else if (gs.userNext) {
      nextLink = <div className='non-item'>
        <LoadLink user={user}
         getRevdditUserItems={getRevdditUserItems}
         kind={kind}
         show={qp.show}
         loadAll={false}/></div>
    }
    if (gs.items.length) {
      lastTimeLoaded = <React.Fragment>
                         <div className='non-item text'>since <Time created_utc={gs.items.slice(-1)[0].created_utc} /></div>
                         <div className='non-item text'>loaded pages {`${gs.num_pages}/${totalPages}`}</div>
                       </React.Fragment>
    }
    return (
      <div className='userpage'>
        <div className='subreddit-box'>
          {loadAllLink}
        </div>
        {selections}
        {
          viewableItems.map(item => {
            if (item.name.slice(0,2) === 't3') {
              return <Post key={item.name} {...item} />
            } else {
              return <Comment key={item.name} {...item} sort={qp.sort}/>
            }
          })
        }
        {lastTimeLoaded}
        {nextLink}
      </div>
    )
  }
}

export default connect(withFetch(User))
