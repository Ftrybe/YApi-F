/* eslint-disable react/sort-comp */
import axios from 'axios'
import PropTypes from 'prop-types'
import React, {PureComponent as Component} from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Icon,
  Input,
  message,
  Modal,
  Popover,
  Radio,
  Row,
  Select,
  Switch,
  Tabs,
  Tooltip,
  Upload,
} from 'antd'
import {connect} from 'react-redux'
import {
  delProject,
  getProject,
  updateProject,
  upsetProject,
} from '../../../../reducer/modules/project'
import {fetchGroupList} from '../../../../reducer/modules/group.js'
import {fetchGroupMsg} from '../../../../reducer/modules/group'
import {setBreadcrumb} from '../../../../reducer/modules/user'

const {TextArea} = Input
import {withRouter} from 'react-router'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
import constants from '../../../../constants/variable.js'

const confirm = Modal.confirm
import '../Setting.scss'
import _ from 'underscore'
import ProjectTag from './ProjectTag.js'
import {entries, htmlFilter, nameLengthLimit, trim} from '../../../../common'
// layout
const formItemLayout = {
  labelCol: {
    lg: {offset: 1, span: 3},
    xs: {span: 24},
    sm: {span: 6},
  },
  wrapperCol: {
    lg: {span: 19},
    xs: {span: 24},
    sm: {span: 14},
  },
  className: 'form-item',
}

const Option = Select.Option

@connect(
  state => {
    return {
      projectList: state.project.projectList,
      groupList: state.group.groupList,
      projectMsg: state.project.currProject,
      currGroup: state.group.currGroup,
    }
  },
  {
    updateProject,
    delProject,
    getProject,
    fetchGroupMsg,
    upsetProject,
    fetchGroupList,
    setBreadcrumb,
  },
)
@withRouter
class ProjectMessage extends Component {
 static propTypes = {
   projectId: PropTypes.number,
   form: PropTypes.object,
   updateProject: PropTypes.func,
   delProject: PropTypes.func,
   getProject: PropTypes.func,
   history: PropTypes.object,
   fetchGroupMsg: PropTypes.func,
   upsetProject: PropTypes.func,
   groupList: PropTypes.array,
   projectList: PropTypes.array,
   projectMsg: PropTypes.object,
   fetchGroupList: PropTypes.func,
   currGroup: PropTypes.object,
   setBreadcrumb: PropTypes.func,
 };

 constructor(props) {
   super(props)
   this.state = {
     protocol: 'http://',
     projectMsg: {},
     showDangerOptions: false,
   }
 }

  // ????????????
  handleOk = e => {
    e.preventDefault()
    const {form, updateProject, projectMsg, groupList} = this.props
    form.validateFields((err, values) => {
      if (!err) {
        let {tag} = this.tag.state
        // let tag = this.refs.tag;
        tag = tag.filter(val => {
          return val.name !== ''
        })
        const assignValue = Object.assign(projectMsg, values, {tag})

        values.protocol = this.state.protocol.split(':')[0]
        const group_id = assignValue.group_id
        const selectGroup = _.find(groupList, item => {
          return item._id == group_id
        })

        updateProject(assignValue)
          .then(res => {
            if (res.payload.data.errcode == 0) {
              this.props.getProject(this.props.projectId)
              message.success('????????????! ')

              // ???????????????????????????????????????????????????
              this.props.fetchGroupMsg(group_id)
              // this.props.history.push('/group');
              const projectName = htmlFilter(assignValue.name)
              this.props.setBreadcrumb([
                {
                  name: selectGroup.group_name,
                  href: `/group/${ group_id}`,
                },
                {
                  name: projectName,
                },
              ])
            }
          })
          .catch(() => {})
        form.resetFields()
      }
    })
  };

  tagSubmit = tag => {
    this.tag = tag
  };

  handleShowConfirm = () => {
    const that = this
    confirm({
      title: `???????????? ${ that.props.projectMsg.name } ????????????`,
      content: (
        <div style={{marginTop: '10px', fontSize: '13px', lineHeight: '25px'}}>
          <Alert
            message='??????????????????????????????,?????????????????????????????????????????????????????????!'
            type='warning'
            banner={true}
          />
          <div style={{marginTop: '16px'}}>
            <p style={{marginBottom: '8px'}}>
              <b>????????????????????????????????????:</b>
            </p>
            <Input id='project_name' size='large' />
          </div>
        </div>
      ),
      onOk() {
        const groupName = trim(document.getElementById('project_name').value)
        if (that.props.projectMsg.name !== groupName) {
          message.error('??????????????????')
          return new Promise((resolve, reject) => {
            reject('error')
          })
        }
        that.props.delProject(that.props.projectId).then(res => {
          if (res.payload.data.errcode == 0) {
            message.success('????????????!')
            that.props.history.push(`/group/${ that.props.projectMsg.group_id}`)
          }
        })
      },
      iconType: 'delete',
      onCancel() {},
    })
  };

  // ?????????????????????????????????
  handleChangeProjectColor = e => {
    const {_id, color, icon, logo} = this.props.projectMsg
    this.props.upsetProject({id: _id, color: e.target.value || color, icon, logo: logo}).then(res => {
      if (res.payload.data.errcode === 0) {
        this.props.getProject(this.props.projectId)
      }
    })
  };

  // ???????????????????????????
  handleChangeProjectIcon = e => {
    const {_id, color, icon} = this.props.projectMsg
    this.props.upsetProject({id: _id, color, icon: e.target.value || icon, logo: null}).then(res => {
      if (res.payload.data.errcode === 0) {
        this.props.getProject(this.props.projectId)
      }
    })
  };

  // ????????????????????????????????????
  handleToggleDangerOptions = () => {
    // console.log(this.state.showDangerOptions);
    this.setState({
      showDangerOptions: !this.state.showDangerOptions,
    })
  };

  async componentWillMount() {
    await this.props.fetchGroupList()
    await this.props.fetchGroupMsg(this.props.projectMsg.group_id)
  }

  render() {
    const {getFieldDecorator} = this.props.form
    const {projectMsg, currGroup} = this.props
    const mockUrl
      = `${location.protocol
      }//${
        location.hostname
      }${location.port !== '' ? `:${ location.port}` : ''
      }/mock/${projectMsg._id}${projectMsg.basepath}+$??????????????????`
    let initFormValues = {}
    const {
      name,
      basepath,
      desc,
      project_type,
      group_id,
      switch_notice,
      strice,
      is_json5,
      tag,
    } = projectMsg
    initFormValues = {
      name,
      basepath,
      desc,
      project_type,
      group_id,
      switch_notice,
      strice,
      is_json5,
      tag,
    }

    const colorArr = entries(constants.PROJECT_COLOR)
    const colorSelector = (
      <RadioGroup value={projectMsg.color} className='color' onChange={this.handleChangeProjectColor}>
        {colorArr.map((item, index) => {
          return (
            <RadioButton
              key={String(index)}
              value={item[0]}
              style={{backgroundColor: item[1], color: '#fff', fontWeight: 'bold'}}>
              {item[0] === projectMsg.color ? <Icon type='check' /> : null}
            </RadioButton>
          )
        })}
      </RadioGroup>
    )
    const iconSelector = (
      <Tabs className='project-icon-selector' defaultActiveKey={projectMsg.logo ? '2' : '1'}>
        <Tabs.TabPane key='1' tab='????????????'>
          <RadioGroup value={projectMsg.icon} className='icon' onChange={this.handleChangeProjectIcon}>
            {constants.PROJECT_ICON.map(item => {
              return (
                <RadioButton key={item} value={item} style={{fontWeight: 'bold'}}>
                  <Icon type={item} />
                </RadioButton>
              )
            })}
          </RadioGroup>
        </Tabs.TabPane>
        <Tabs.TabPane key='2' tab='????????????'>
          <Upload
            accept='.jpg,.jpeg,.png,.svg,.gif'
            name='avatar'
            listType='picture-card'
            style={{margin: 'auto'}}
            showUploadList={false}
            beforeUpload={file => {
              const fr = new FileReader()
              fr.onload = async () => {
                const uploadRes = await axios.post('/api/file/upload', {
                  name: file.name,
                  mimeType: file.type,
                  base64: fr.result.split(';base64,')[1],
                  extra: {
                    logo4project: this.props.projectId,
                  },
                })
                if (uploadRes.data.errcode !== 0) {
                  return message.error(uploadRes.data.errmsg)
                }
                const {_id, color} = this.props.projectMsg
                const res = await this.props.upsetProject({id: _id, color, icon: null, logo: uploadRes.data.data.id})
                if (res.payload.data.errcode === 0) {
                  this.props.getProject(this.props.projectId)
                } else {
                  message.error(res.payload.data.errmsg)
                }
              }
              fr.readAsDataURL(file)
              return false
            }}>
            {
              projectMsg.logo
                ? (
                  <img
                    src={`/api/file/download?id=${projectMsg.logo}`}
                    style={{maxWidth: '100%'}}
                  />
                )
                : (
                  <div>
                    <Icon type='plus' />
                    <div className='ant-upload-text'>??????</div>
                  </div>
                )}
          </Upload>
        </Tabs.TabPane>
      </Tabs>
    )
    const selectDisbaled = projectMsg.role === 'owner' || projectMsg.role === 'admin'
    return (
      <div>
        <div className='m-panel'>
          <Row className='project-setting'>
            <Col xs={6} lg={{offset: 1, span: 3}} className='setting-logo'>
              <Popover
                placement='bottom'
                title={colorSelector}
                content={iconSelector}
                trigger='click'
                overlayClassName='change-project-container'>
                {
                  projectMsg.logo
                    ? (
                      <img
                        src={`/api/file/download?id=${projectMsg.logo}`}
                        className='ui-logo'
                        style={{
                          backgroundColor:
                          constants.PROJECT_COLOR[projectMsg.color] || constants.PROJECT_COLOR.blue,
                        }}
                      />
                    )
                    : (
                      <Icon
                        type={projectMsg.icon || 'star-o'}
                        className='ui-logo'
                        style={{
                          backgroundColor:
                          constants.PROJECT_COLOR[projectMsg.color] || constants.PROJECT_COLOR.blue,
                        }}
                      />
                    )
                }
              </Popover>
            </Col>
            <Col xs={18} sm={15} lg={19} className='setting-intro'>
              <h2 className='ui-title'>
                {`${currGroup.group_name || '' } / ${ projectMsg.name || ''}`}
              </h2>
              {/* <p className="ui-desc">{projectMsg.desc}</p> */}
            </Col>
          </Row>
          <hr className='breakline' />
          <Form>
            <FormItem {...formItemLayout} label='??????ID'>
              <span>{this.props.projectMsg._id}</span>
            </FormItem>
            <FormItem {...formItemLayout} label='????????????'>
              {getFieldDecorator('name', {
                initialValue: initFormValues.name,
                rules: nameLengthLimit('??????'),
              })(<Input />)}
            </FormItem>
            <FormItem {...formItemLayout} label='????????????'>
              {getFieldDecorator('group_id', {
                initialValue: `${initFormValues.group_id }`,
                rules: [
                  {
                    required: true,
                    message: '??????????????????????????????!',
                  },
                ],
              })(
                <Select disabled={!selectDisbaled}>
                  {this.props.groupList.map((item, index) => (
                    <Option key={String(index)} value={item._id.toString()}>
                      {item.group_name}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>

            <FormItem
              {...formItemLayout}
              label={(
                <span>
                  ??????????????????&nbsp;
                  <Tooltip title='?????????????????????????????????'>
                    <Icon type='question-circle-o' />
                  </Tooltip>
                </span>
              )}>
              {getFieldDecorator('basepath', {
                initialValue: initFormValues.basepath,
                rules: [
                  {
                    required: false,
                    message: '?????????????????????! ',
                  },
                ],
              })(<Input />)}
            </FormItem>

            <FormItem
              {...formItemLayout}
              label={(
                <span>
                  MOCK??????&nbsp;
                  <Tooltip title='?????????????????????????????????'>
                    <Icon type='question-circle-o' />
                  </Tooltip>
                </span>
              )}>
              <Input disabled={true} value={mockUrl} onChange={() => {}} />
            </FormItem>

            <FormItem {...formItemLayout} label='??????'>
              {getFieldDecorator('desc', {
                initialValue: initFormValues.desc,
                rules: [
                  {
                    required: false,
                  },
                ],
              })(<TextArea rows={8} />)}
            </FormItem>

            <FormItem
              {...formItemLayout}
              label={(
                <span>
                  tag ??????&nbsp;
                  <Tooltip title='?????? tag ?????????????????????'>
                    <Icon type='question-circle-o' />
                  </Tooltip>
                </span>
              )}>
              <ProjectTag ref={this.tagSubmit} tagMsg={tag} />
              {/* <Tag tagMsg={tag} ref={this.tagSubmit} /> */}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={(
                <span>
                  mock????????????&nbsp;
                  <Tooltip title='????????? mock ???????????? query???body form ?????????????????? json schema ????????????'>
                    <Icon type='question-circle-o' />
                  </Tooltip>
                </span>
              )}>
              {getFieldDecorator('strice', {
                valuePropName: 'checked',
                initialValue: initFormValues.strice,
              })(<Switch checkedChildren='???' unCheckedChildren='???' />)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={(
                <span>
                  ??????json5&nbsp;
                  <Tooltip title='????????????????????? body ?????????????????? json ??????'>
                    <Icon type='question-circle-o' />
                  </Tooltip>
                </span>
              )}>
              {getFieldDecorator('is_json5', {
                valuePropName: 'checked',
                initialValue: initFormValues.is_json5,
              })(<Switch checkedChildren='???' unCheckedChildren='???' />)}
            </FormItem>
            <FormItem {...formItemLayout} label='????????????????????????'>
              {getFieldDecorator('switch_notice', {
                valuePropName: 'checked',
                initialValue: initFormValues.switch_notice,
              })(<Switch checkedChildren='???' unCheckedChildren='???' />)}
            </FormItem>

            <FormItem {...formItemLayout} label='??????'>
              {getFieldDecorator('project_type', {
                rules: [
                  {
                    required: true,
                  },
                ],
                initialValue: initFormValues.project_type,
              })(
                <RadioGroup>
                  <Radio value='private' className='radio'>
                    <Icon type='lock' />??????<br />
                    <span className='radio-desc'>???????????????????????????????????????????????????????????????</span>
                  </Radio>
                  <br />
                  {projectMsg.role === 'admin' && (
                    <Radio value='public' className='radio'>
                      <Icon type='unlock' />??????<br />
                      <span className='radio-desc'>?????????????????????????????????????????????</span>
                    </Radio>
                  )}

                </RadioGroup>,
              )}
            </FormItem>
          </Form>

          <div className='btnwrap-changeproject'>
            <Button
              className='m-btn btn-save'
              icon='save'
              type='primary'
              size='large'
              onClick={this.handleOk}>
              ??? ???
            </Button>
          </div>

          {/* ????????????????????????????????????????????? */}
          {projectMsg.role === 'owner' || projectMsg.role === 'admin' ? (
            <div className='danger-container'>
              <div className='title'>
                <h2 className='content'>
                  <Icon type='exclamation-circle-o' /> ????????????
                </h2>
                <Button onClick={this.handleToggleDangerOptions}>
                  ??? ???<Icon type={this.state.showDangerOptions ? 'up' : 'down'} />
                </Button>
              </div>
              {this.state.showDangerOptions ? (
                <Card hoverable={true} className='card-danger'>
                  <div className='card-danger-content'>
                    <h3>????????????</h3>
                    <p>???????????????????????????????????????????????????????????????</p>
                    <p>????????????????????????????????????????????????</p>
                  </div>
                  <Button
                    type='danger'
                    ghost={true}
                    className='card-danger-btn'
                    onClick={this.handleShowConfirm}>
                    ??????
                  </Button>
                </Card>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    )
  }
}

export default Form.create()(ProjectMessage)
