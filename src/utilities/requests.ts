import axios from "axios"

const getNewToken = async () => {
    const storage = JSON.parse(localStorage.getItem('boilerplate') || '{}')
    const refreshToken = storage.refreshToken
    try {
        const { data } = await axios.post('http://localhost:3001/token', {
            token: refreshToken
        })
        if (data.accessToken && data.refreshToken){
            localStorage.setItem('boilerplate', JSON.stringify({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
            }))
        }
        return data.accessToken
    } catch (err: any) {
        return null
    }
}

export async function getRequest(uri: string){
    const storage = JSON.parse(localStorage.getItem('boilerplate') || '{}')
    const token = storage.accessToken
    try {
        const res = await axios.get(uri, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        return res.data
    } catch (err: any) {
        if (err.response.status && err.response.status === 403){
            const token = await getNewToken()
            if (token){
                const data: {} = await getRequest(uri)    
                return data
            }
        }
    }
}

export async function postRequest(uri: string, data: any){
    let d = data
    const storage = JSON.parse(localStorage.getItem('boilerplate') || '{}')
    const token = storage.accessToken
    try {
        const res = await axios.post(uri, data, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        return res.data
    } catch (err: any) {
        if (err.response.status && err.response.status === 403){
            const token = await getNewToken()
            if (token){
                const data: {} = await postRequest(uri, d)    
                return data
            }
        }
    }
}