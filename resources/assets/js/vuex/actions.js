import _ from 'lodash'
import RandExp from 'randexp'

export const loadRoutes = function ({dispatch}) {
    this.$api.ajax('GET', 'routes')
        .then(function (response) {
            let routes = response.data
            let order = 0

            let parsedRoutes = _.map(routes, function (route) {
                route.type = 'route'
                route.order = order++
                return route
            })

            dispatch('SET_ROUTES', parsedRoutes)
        })
}

export const loadRequests = function ({dispatch}) {
    this.$api.ajax('GET', 'requests')
        .then(function (response) {
            dispatch('SET_REQUESTS', response.data)
        })
}

export const setCurrentRequest = ({dispatch}, request) => {
    dispatch('SET_CURRENT_REQUEST', request)
}

export const setCurrentRequestFromRoute = ({dispatch}, route) => {
    let request = {
        method: route.methods[0],
        path: route.path,
        name: "",
        body: "",
        wheres: route.wheres,
        headers: [],
        config: {
            addCRSF: true,
        }
    }

    dispatch('SET_CURRENT_REQUEST', request)
}

export const deleteRequest = function ({dispatch}, request) {
    dispatch('DELETE_REQUEST', request)
    this.$api.ajax('DELETE', 'requests/' + request.id)
}

export const saveRequest = function ({dispatch}, request) {
    this.$api.ajax('POST', 'requests', this.request)
        .then(function (data) {
            this.setCurrentRequest(data.data)
            this.loadRequests()
        })
}

export const getCurrentRequestRoute = function ({dispatch}) {
    let headers = _.cloneDeep(this.currentRequest.headers)
    let wheres = _.cloneDeep(this.currentRequest.wheres)


    let request = this.currentRequest
    let path = this.request.path

    // Process routes that have leading slash.
    path = path === '/' ? path : '/' + path

    // Fill path template with random strings generated by regexp where
    for(let index in wheres){
        let mocker = new RandExp(new RegExp(wheres[index]))
        let dummy = new RegExp('{'+index+'}', 'g')

        path = path.replace(dummy, mocker.gen())
    }



    headers.push({key: 'X-Api-Tester', value: 1})

    this.$api.ajax(request.method, path, request.body, headers)
        .always((response) => {
            let route = response.data

            dispatch('SET_CURRENT_ROUTE', route)
        })
}

export const updateRequest = function ({dispatch}, request) {
    this.$api.ajax('PUT', 'requests/' + request.id, request)
        .then(function (data) {
            this.setCurrentRequest(data.data)
            this.loadRequests()
        })
}

export const scheduleRequest = ({dispatch}, status) => dispatch('SET_REQUEST_SCHEDULED', status)
