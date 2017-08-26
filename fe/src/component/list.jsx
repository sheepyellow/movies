
import React, { Component } from 'react';
import {
    Link
} from "react-router-dom"
import {
    ListView,
    SwipeAction,
    Icon
} from 'antd-mobile'
import Dotdotdot from 'react-dotdotdot'
import Util from "../util/Util.js"

export default class List extends Component {

    constructor(props) {
        super(props)
        this.props = props
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => { return r1 !== r2 }
        })
        this._footer = this._footer.bind(this)
        this._row = this._row.bind(this)
        this.ds = ds
        this.state = {
            _data: []
        }
    }

    _sectionBtns(rowData, rowId) {
        const { login, parent } = this.props
        let rightBtns = [
            {
                text: rowData.isCollect ? '移除' : '收藏',
                onPress: () => {
                    if (!login) {
                        Util.Toast.info('请登录')
                        return
                    }
                    if (!rowData.isCollect) {
                        //收藏
                        Util.fetch(`/api/movies/${rowData._id}/collect`, {
                            method: 'POST'
                        }).then(res => {
                            if (!res.code) {
                                Util.Toast.info('已收藏')
                            }
                        })
                    } else {
                        Util.fetch(`/api/user/colltions/${rowData._id}/delete`, {
                            method: 'POST'
                        }).then(res => {
                            if (!res.code) {
                                Util.Toast.info('已移除')
                            }
                        })
                    }

                },
                className: 'btn'
            }
        ]
        //收藏列表中按钮是移除
        if (parent) {
            rightBtns = [{
                text: '移除',
                onPress: () => {
                    Util.fetch(`/api/user/colltions/${rowData._id}/delete`, {
                        method: 'POST'
                    }).then(res => {
                        if (!res.code) {
                            const d = this.state._data
                            d.splice(rowId, 1)
                            this.setState({
                                _data: d
                            })
                            Util.Toast.info('已移除')
                        }
                    })
                },
                className: 'btn'
            }]
        }
        if (login) {
            rightBtns = this._renderAllowedBtns(rightBtns, rowData, login)
        }
        return rightBtns
    }

    _renderAllowedBtns(rightBtns, rowData, login) {
        return rightBtns.concat([{
            text: '修改',
            onPress: () => {
                this.props.history.push(`/detail/${rowData._id}`, {
                    title: rowData.title,
                    edit: true,
                    login
                })
            },
            className: 'btn'
        },
        {
            text: '删除',
            onPress: () => { this.props.deleteOne(rowData._id) },
            className: 'btn delete'
        }])
    }

    _row(rowData, sectionId, rowId) {
        const { login, parent } = this.props
        const rightBtns = this._sectionBtns(rowData, rowId)
        return <div className='listview-item' key={rowId}>
            <div className="m-item">
                <SwipeAction autoClose right={rightBtns}>
                    <Link to={{
                        pathname: `/detail/${rowData._id}`,
                        state: {
                            title: rowData.title,
                            login
                        }
                    }}>
                        <img src={rowData.thumb} alt={rowData.title} className="m-item-thumb"></img>
                        <div className="m-item-wrap">
                            <div className="m-item-instruction-props">
                                <span className='label weight'>{rowData.title}</span>
                                <span className='label'>{rowData.type.join('/')}</span>
                                <span className='label'>{rowData.actors.join('/')}</span>
                            </div>
                            <Dotdotdot clamp={4}>
                                <p className="m-item-instruct">
                                    {rowData.instruct}
                                </p>
                            </Dotdotdot>
                        </div>
                    </Link>
                </SwipeAction>
            </div>
            <p className="separator"></p>
        </div>
    }

    _footer() {
        return <div className="footer" style={{ textAlign: 'center' }}>
            {(this.props.noMore && this.props.dataLen > 10) ? '没有了' : this.props.loading ? 'Loading...' : ''}
        </div>
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            _data: nextProps.datasource
        })
    }

    _noData() {
        const d = this.state._data
        return d && !d.length
    }

    render() {
        const dss = this.ds.cloneWithRows(this.state._data)
        return (
            this._noData() ? <div className='noData'>
                <Icon type={require('../common/svg/no-data.svg')} size="lg" />
            </div> :
                <ListView className="listview" dataSource={dss}
                    renderRow={this._row}
                    renderFooter={this._footer}
                    onScroll={() => { }}
                    style={{
                        height: (document.documentElement.clientHeight - 110)
                    }}
                    useZscroller
                    pageSize={10}
                    onEndReached={this.props.onEndReached}
                    onEndReachedThreshold={20}
                    scrollEventThrottle={100}>
                </ListView>
        )
    }
}