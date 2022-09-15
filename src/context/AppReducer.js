export function AppReducer(state, action){
    switch(action.type){
        case 'SET_USER':
            return { 
                ...state, 
                user: action.payload
            }
        case 'SET_MEMBERS':
            return {
                ...state,
                members: action.payload
            }
        case 'CLEAR_MEMBERS':
            return {
                ...state,
                members: []
            }
        default:
            return state
    }
}

export function setMembers(data){
    return {
        type: 'SET_MEMBERS',
        payload: data
    }
}

export function clearMembers(){
    return {
        type: 'CLEAR_MEMBERS'
    }
}

export function setUser(data){
    return {
        type: 'SET_USER',
        payload: data
    }
}