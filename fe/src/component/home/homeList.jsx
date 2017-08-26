
import React, { Component } from 'react';
import {
    ListView,
    Icon
} from 'antd-mobile'
import Util from "../../util/Util.js"
import List from "../list"

export default class Home extends Component {

    constructor(props) {
        super(props)
        this.props = props
        this._data = []
        this.state = {
            loading: true,
            noMore: false,
            isSearch: false
        }
        this.onEndReached = this.onEndReached.bind(this)
        this.deleteOne = this.deleteOne.bind(this)
    }

    /**
     * 当选择了分类，或输入了搜索内容时，数据传递进来，查询
     * @param {*} nextProps 
     */
    componentWillReceiveProps(nextProps) {
        const { category, search } = nextProps
        if (this.state.loading) {
            return
        }
        this.setState({
            loading: true,
            isSearch: true
        })
        this._fetch(category, search)
    }


    _handleQuery(category, search) {
        let cateStr
        let searchStr
        category && (cateStr = 'cate=' + category)
        search && (searchStr = 'content=' + search)
        if (cateStr && searchStr) {
            return cateStr + '&' + searchStr
        }
        if (cateStr) {
            return cateStr
        }
        if (searchStr) {
            return searchStr
        }

    }

    /**
     * 根据props中的值来判断发搜索请求还是直接获取列表
     */

    _fetch(category, search) {
        let promise
        if (category || search) {
            const str = this._handleQuery(category, search)
            promise = Util.fetch('/api/movies/search/by?' + str)
            //分类、搜索时不分页
        }
        if (!category && !search) {
            this.setState({
                isSearch: false
            })
            promise = Util.fetch('/api/movies')
        }
        promise.then(res => {
            if (!res.code) {
                this._data = []
                this._mergeCollectStatus(res.data)
            } else {
                this.setState({
                    loading: false,
                })
            }
        })
    }

    _mergeCollectStatus(data) {
        const ids = data.map(item => {
            return item._id
        })
        const obj = {}
        if (!ids.length) {
            this.dataRecieve(data)
            return
        }
        Util.fetch(`/api/movies/list/checkCollect/?ids=${ids}`).then(collects => {
            if (collects)
                collects.data.forEach(item => {
                    if (item) {
                        obj[item.movieId] = item.isCollect
                    }
                })
            data.forEach(item => {
                if (obj[item._id]) {
                    item.isCollect = true
                }
            })
            this.dataRecieve(data)
        })

    }


    dataRecieve(data) {
        this._data = this._data.concat(data)
        if (this._data.length) {
            this.latestTime = this._data[this._data.length - 1].updateTime
        }
        this.setState({
            loading: false,
            noMore: false
        })
    }

    onEndReached(e) {
        if (this.state.loading || this.state.noMore || this.state.isSearch) {
            return
        }
        this.setState({
            loading: true
        })
        Util.fetch('/api/movies?latest=' + this.latestTime).then(res => {
            if (res.data.length) {
                this._mergeCollectStatus(res.data)
            } else {
                this.setState({
                    loading: false,
                    noMore: true,
                })
            }
        })

    }

    deleteOne(id) {
        Util.fetch('/api/movies/' + id, {
            method: 'DELETE'
        }).then(res => {
            this.props.flushTypes()
        })
    }


    componentDidMount() {
        this._fetch()
    }


    render() {
        const { noMore, loading } = this.state
        return <List
            noMore={noMore}
            loading={loading}
            datasource={this._data}
            dataLen={this._data.length}
            onEndReached={this.onEndReached}
            deleteOne={this.deleteOne}
            {...this.props}></List>
    }

    /**
     * noMore
     * loading
     * dataLen
     * datasource
     * onEndReached
     * deleteOne
     * 
     * login
     * history
     */

}