import { Box, Button, PasswordInput, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import axios from "axios";
import { showNotification } from '@mantine/notifications'
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ResetPassword(){

    const navigate = useNavigate()

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const token = (urlParams.get('k'))
        axios.post('http://localhost:3001/validateTempToken', { token })
            .then(() => {})
            .catch(() => {
                showNotification({
                    color: 'red',
                    title: 'Error',
                    message: 'Link has expired. Please try \'Forgot Password\' again'
                })
                navigate('/')
            })
    }, [navigate])

    const handleResetPassword = async () => {
        resetPasswordForm.validate()
        if (resetPasswordForm.values.password === ''){
            resetPasswordForm.setFieldError('password', 'Password cannot be blank')
        } else if (resetPasswordForm.values.confirmPassword === '') {
            resetPasswordForm.setFieldError('confirmPassword', 'Password cannot be blank')
        } else if (!resetPasswordForm.validate().hasErrors){
            let params = new URLSearchParams(document.location.search)
            const k = params.get('k')
            try {
                const { data } = await axios.post('http://localhost:3001/resetPassword', { k, password: resetPasswordForm.values.password })
                console.log(data)
                showNotification({
                    title: 'Great Success',
                    message: 'Password has been reset'
                })
                navigate('/')
            } catch (err: any) {
                if (err.response.status === 403){
                    showNotification({
                        color: 'red',
                        title: 'Error',
                        message: 'Link has expired. Please try \'Forgot Password\' again'
                    })
                    navigate('/')
                }
            }
        }
    }

    const resetPasswordForm: any = useForm({
        initialValues: {
          password: '',
          confirmPassword: ''
        },
        validate: {
          password: (value: string) => value !== resetPasswordForm.values.confirmPassword ? 'Passwords must match' : null,
          confirmPassword: (value: string) => value !== resetPasswordForm.values.password ? 'Passwords must match' : null
        },
    });

    return (
        <Box sx={{ maxWidth: 300 }} mx="auto">
            <Text mb={8}>Reset Your Password</Text>
            <Text size="xs">Enter New Password</Text>
            <PasswordInput
                mb={8}
                withAsterisk
                {...resetPasswordForm.getInputProps('password')}
            />
            <Text size="xs">Confirm New Password</Text>
            <PasswordInput
                mb={8}
                withAsterisk
                {...resetPasswordForm.getInputProps('confirmPassword')}
            />    
            <Button onClick={handleResetPassword}>Submit</Button>
        </Box>
    )
}