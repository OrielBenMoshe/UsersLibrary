import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Form, Input, Popconfirm, Table, Space, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import Highlighter from 'react-highlight-words';

import AddUser from './AddUser';



const UsersTable = ({ data, state }) => {
  const [form] = Form.useForm();
  const [count, setCount] = useState(2);
  const [editingKey, setEditingKey] = useState('');
  const emails = data.map((user) => user.email);
  const isEditing = (record) => record.key === editingKey;


  /** Search filter */
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  /** End Search filter */

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          (dataIndex === 'email')
            ? (
              <Form.Item
                name={dataIndex}
                style={{
                  margin: 0,
                }}
                rules={[
                  { required: true, message: `Please Input ${title}!`, type: 'email' },
                  {
                    /** Validate for unique email. */
                    validator: (_, value) =>
                      // console.log(`values: ${value}, emails:`, emails) &&
                      value && emails.find(email => value.trim() === email)
                        ? Promise.reject(new Error('This email is already in use by another user'))
                        : Promise.resolve(),
                    message: 'This email is already in use by another user'
                  }
                ]}
              >
                {inputNode}
              </Form.Item>
            ) : (
              (dataIndex === 'name')
                ? (
                  <Form.Item
                    name={dataIndex}
                    style={{
                      margin: 0,
                    }}
                    rules={[
                      { required: true, message: `Please Input ${title}!` },
                      { min: 3, message: 'name must be minimum 3 characters.' },
                    ]}
                  >
                    {inputNode}
                  </Form.Item>
                ) : (
                  <Form.Item
                    name={dataIndex}
                    style={{
                      margin: 0,
                    }}
                    rules={[{ required: true, message: `Please Input ${title}!` }]}
                  >
                    {inputNode}
                  </Form.Item>
                )
            )
        ) : (
          children
        )
        }
      </td >
    );
  };

  const edit = (record) => {
    console.log(record);
    form.setFieldsValue({
      name: '',
      email: '',
      location: '',
      ...record,
    });
    setEditingKey(record.key);
  };
  const cancel = () => {
    setEditingKey('');
  };
  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        state.users = newData;
        setEditingKey('');
      } else {
        newData.push(row);
        state.users = newData;
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };


  const handleDelete = (key) => {
    const newData = data.filter((item) => item.key !== key);
    state.users = newData;
  };

  const columns = [
    {
      title: 'Picture',
      dataIndex: 'userImage',
      fixed: 'left',
      width: 102,
      render: userImage => <img className='userImage' alt={userImage} src={userImage} />
    },
    {
      title: 'Name',
      dataIndex: 'name',
      editable: true,
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      editable: true,
      ...getColumnSearchProps('email'),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      editable: true,
    },
    {
      title: 'UUID',
      dataIndex: 'uuid',
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      fixed: 'right',
      width: 112,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Typography.Link onClick={() => save(record.key)}>
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </Space >
        ) : (
          <Space>
            <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
              Edit
            </Typography.Link>
            <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
              <a disabled={editingKey !== ''}>Delete</a>
            </Popconfirm>
          </Space >
        )
      }
    },
  ];

  const handleAdd = (values) => {
    console.log('values:', values);
    const newData = {
      key: count,
      userImage: values.userImage,
      name: values.name,
      email: values.email,
      location: values.location,
      uuid: uuidv4(),
    };
    state.users = [...data, newData];
    console.log("data:", data);
    setCount(count + 1);
  };




  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div>
      <AddUser handleAdd={handleAdd} emails={emails} />
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
            pageSize: 5
          }}
          scroll={{
            x: 1500,
          }}
        />
      </Form>
    </div>
  );
};
export default UsersTable;