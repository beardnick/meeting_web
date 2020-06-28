import service from '@/utils/request'

export const createMeeting = (data) => {
    return service({
        url: "/meeting/create",
        method: 'post',
        data
    })
}

export const endMeeting = (data) => {
    return service({
        url: "/meeting/end",
        method: 'post',
        data
    })
}


export const joinMeeting = (data) => {
    return service({
        url: "/meeting/join",
        method: 'post',
        data
    })
}


export const leaveMeeting = (data) => {
    return service({
        url: "/meeting/leave",
        method: 'post',
        data
    })
}
