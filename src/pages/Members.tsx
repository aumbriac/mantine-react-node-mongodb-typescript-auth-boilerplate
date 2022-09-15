import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Box, Button, List, Loader, ThemeIcon, Tabs, Text, PasswordInput, Modal } from "@mantine/core"
import { IconSettings, IconUser } from '@tabler/icons';
import { useAppContext } from "../context/AppContext";
import { getRequest } from "../utilities/requests";
import { useForm } from "@mantine/form";
import { showNotification } from '@mantine/notifications';
import { setMembers, clearMembers } from "../context/AppReducer";
import { postRequest } from '../utilities/requests'

export default function Members(){

    const { state, dispatch, storage } = useAppContext()
    const [loading, setLoading] = useState(false)
    const [opened, setOpened] = useState(false);
    const navigate = useNavigate()

    const handleLogout = useCallback(async () => {
        const refreshToken = storage.refreshToken
        const { status } = await axios.post('http://localhost:3001/logout', { refreshToken })
        if (status === 200) {
            dispatch(clearMembers())
            navigate('/')
        }
    }, [dispatch, navigate, storage.refreshToken])

    const fetchMembers = useCallback(async () => {
        setLoading(true)
        const data = await getRequest('http://localhost:3001/members')
        if (data !== undefined) {
            dispatch(setMembers(data))
        } else {
            await handleLogout()
            showNotification({
                title: 'Inactive session',
                message: 'You have been logged out due to inactivity',
            })
        }
        setLoading(false)
    }, [dispatch, handleLogout])

    const handleResetPassword = async () => {
        resetPasswordForm.validate()
        if (resetPasswordForm.values.currentPassword === '') {
            resetPasswordForm.setFieldError('currentPassword', 'Field cannot be blank')
        } else if (resetPasswordForm.values.newPassword === ''){
            resetPasswordForm.setFieldError('newPassword', 'Field cannot be blank')
        } else if (resetPasswordForm.values.confirmNewPassword === '') {
            resetPasswordForm.setFieldError('confirmNewPassword', 'Field cannot be blank')
        } else if (
                (resetPasswordForm.values.currentPassword === resetPasswordForm.values.newPassword) || 
                (resetPasswordForm.values.currentPassword === resetPasswordForm.values.confirmNewPassword)) {
            resetPasswordForm.setFieldError('currentPassword', 'Current password cannot match new password')
        } else if (!resetPasswordForm.validate().hasErrors){

            try {
                const res = await postRequest('http://localhost:3001/changePassword', { 
                    currentPassword: resetPasswordForm.values.currentPassword,
                    newPassword: resetPasswordForm.values.newPassword 
                })

                if (res.msg === 'success') {
                    showNotification({
                        title: 'Great Success',
                        message: 'Password has been reset'
                    })
                    resetPasswordForm.reset()
                    setOpened(false)
                } else if (res.msg === 'error') {
                    showNotification({
                        color: 'red',
                        title: 'Error',
                        message: 'Invalid password'
                    })
                    resetPasswordForm.reset()

                }
            } catch (err: any) {
                if (err.msg === 'error') {
                    showNotification({
                        color: 'red',
                        title: 'Error',
                        message: 'Invalid password'
                    })
                    resetPasswordForm.reset()
                } else {
                    showNotification({
                        color: 'red',
                        title: 'Error',
                        message: 'An authentication error occurred. Please login again'
                    }) 
                    navigate('/')
                }
            }
        }
    }

    const resetPasswordForm: any = useForm({
        initialValues: {
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        },
        validate: {
            newPassword: (value: string) => value !== resetPasswordForm.values.confirmNewPassword ? 'Passwords must match' : null,
            confirmNewPassword: (value: string) => value !== resetPasswordForm.values.newPassword ? 'Passwords must match' : null
        },
    })

    useEffect(() => {
        let isSubscribed = true
        if (isSubscribed){
            fetchMembers()
        }
        return () => {
            isSubscribed = false
        }
    }, [fetchMembers])

    return (
        <>
            <Tabs defaultValue="members">
            <Tabs.List>
                <Tabs.Tab icon={<IconUser />} value="members">Members</Tabs.Tab>
                <Tabs.Tab icon={<IconSettings />} value="settings">Settings</Tabs.Tab>
            </Tabs.List>
    
            <Tabs.Panel value="members" pt="xs">
            <Box sx={{ maxWidth: 300 }} mx="auto">
                    {loading && <Loader mt={8} variant="bars" />}
                    {!loading && <h5>Logged in as {state.user && state.user}</h5>}
                    <List
                        spacing="xs"
                        size="sm"
                        center
                        mb={12}
                        icon={
                            <ThemeIcon color="teal" size={24} radius="xl">
                                <IconUser size={16} />
                            </ThemeIcon>
                        }
                        >
                        {state.members && state.members.map((member: any) => (
                            <List.Item key={member}>{member}</List.Item>
                        ))}
                        </List>
                    <Button onClick={handleLogout}>Logout</Button>
            </Box>
            </Tabs.Panel>
    
            <Tabs.Panel value="settings" pt="xs">
                <Text>Settings</Text>
                <Button onClick={() => setOpened(true)} mt={8}>Change Password</Button>
            </Tabs.Panel>
        </Tabs>
        <Modal
            centered
            opened={opened}
            title={'Enter your current password and new password'}
            withCloseButton
            onClose={() => setOpened(false)}
            size="lg"
            radius="md"
        >
        <PasswordInput label={'Current password'} mb={8} {...resetPasswordForm.getInputProps('currentPassword')} style={{ flex: 1 }} />
        <PasswordInput label={'New password'} mb={8} {...resetPasswordForm.getInputProps('newPassword')} style={{ flex: 1 }} />
        <PasswordInput label={'Confirm new password'} mb={16} {...resetPasswordForm.getInputProps('confirmNewPassword')} style={{ flex: 1 }} />
        <Button onClick={handleResetPassword}>Change Password</Button>
      </Modal>
    </>
    )
}