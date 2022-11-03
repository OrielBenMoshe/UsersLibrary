import React, { useEffect, useState, useRef } from 'react';

import { Button, Modal, Form, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function AddUser({ handleAdd, emails }) {
    const formRef = useRef()
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState('Content of the modal');

    const showModal = () => {
        setOpen(true);
    };
    const handleOk = () => {
        formRef.current.submit();
        // setTimeout(() => {s
        //     setOpen(false);
        //     setConfirmLoading(false);
        // }, 1000);
    };
    const handleCancel = () => {
        console.log('Clicked cancel button');
        setOpen(false);
    };


    const onFinish = (values) => {
        console.log(values);
        setConfirmLoading(true);
        setTimeout(() => {
            handleAdd(values)
            setOpen(false);
            setConfirmLoading(false);
        }, 300);

    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const validateMessages = {
        required: '${label} is required!',
        types: {
            email: '${label} is not a valid email!',
        },
    };

    return (
        <>
            <Button
                onClick={showModal}
                type="primary"
                style={{
                    marginBottom: 16,
                }}
                icon={<PlusOutlined />}
                size="large"
            // shape="round"
            >
                Add user
            </Button>
            <Modal
                title="New User"
                open={open}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
            >
                <Form
                    ref={formRef}
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    validateMessages={validateMessages}
                >
                    <Form.Item
                        label="Full name"
                        name="name"
                        rules={[
                            { required: true },
                            { min: 3, message: 'Full name must be minimum 3 characters.' }
                        ]}

                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            {
                                required: true,
                                type: 'email',
                            },
                            {
                                validator: (_, value) =>
                                    value && emails.find(email => value.trim() === email)
                                        ? Promise.reject(new Error('This email is already in use by another user'))
                                        : Promise.resolve(),
                                message: 'This email is already in use by another user'
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Location (country, city, street number.)"
                        name="location"
                        rules={[{ required: true, },]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="URL of user image"
                        name="userImage"
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}
