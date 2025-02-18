import React, {Component} from 'react';
import {
    Container,
    Button,
    Input,
    InputGroup,
    Table,
    Col} from 'reactstrap';

import moment from 'moment';

import UserStore from '../state/UserStore';
import DB from '../state/DB';

export default class TimeTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sessions: [],
            current_time: moment(),
            hidden_id: '',
            id: ''
        };
        this.loginLogoutFunc = this.loginLogoutFunc.bind(this);
        this.onSubmit = this.onSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        //I'm leaving this in for now but I hate it and want to just remove it
    }
    handleChange(event) {
        this.setState({'id': event.target.value});
    }

    handleKeyPress(event) {
        if (event.which === 13) {
            this.loginLogoutFunc(this.state.hidden_id);
            this.setState({
                hidden_id: ''
            });
        } else {
            this.setState({
                hidden_id: this.state.hidden_id + String.fromCharCode(event.which)
            });
        }
    }
    onSubmit(e) {
        e.preventDefault();
        console.log(this.state.id);
        this.loginLogoutFunc(this.state.id);
        this.setState({
            id: ""
        });
    }
    loginLogoutFunc(userId) {
        const match = DB.query({
            id: userId
        });
        if (match) {
            const index = this.state.sessions.findIndex(session => session.user.id === match.id);
            if (index === -1) {
                UserStore.signInUser(match);
            } else {
                const session = this.state.sessions[index];
                session.session.end = moment().toISOString();
                const duration = moment(session.session.end).diff(session.session.start);
                if (duration > moment.duration(5, 'seconds') && duration < moment.duration(12, 'hours')) {
                    DB.addSession(session.user, session.session);
                }
                UserStore.signOutUser(session.user, session.session);
            }
        }
    }
    componentDidMount() {
        document.addEventListener('keypress', this.handleKeyPress, false);

        setInterval(this.tick.bind(this), 1000);

        UserStore.onAddUser(() => this.setState({
            hidden_id: ''
        }));

        UserStore.onSignInUser(user => this.setState({
            sessions: this.state.sessions.concat([{
                user: {
                    name: user.name,
                    id: user.id
                },
                session: {
                    start: moment().toISOString()
                }
            }])
        }));

        UserStore.onSignOutUser(({user}) => {
            const index = this.state.sessions.findIndex(session => session.user.id === user.id);

            const newSessions = this.state.sessions.slice();

            newSessions.splice(index, 1);

            this.setState({
                sessions: newSessions
            });
        });
    }

    static formatTime(time) {
        time = time / 1000;

        const hours = Math.floor(time / (60 * 60));
        time -= hours * (60 * 60);

        const minutes = Math.floor(time / 60);
        time -= minutes * 60;

        const seconds = Math.round(time);

        const pad = number => number.toString().length === 1 ? '0' + number : number;

        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    tick() {
        this.setState({
            current_time: moment()//DB.current_time
        });
    }

    render() {
        return (
            <Col>
                <Container className='UserDisplay' style={{height: '10%'}}>
                    <h2 className='Header'>Login/Logout</h2>
                    <form onSubmit={this.onSubmit}>
                        <InputGroup>
                            <Input
                            name='id'
                            placeholder='Student ID/Password'
                            value={this.state.id}
                            onChange={this.handleChange}
                            />
                        </InputGroup>
                        <Button
                            color='light'
                            onClick={this.onSubmit}
                            type='submit'
                        >Log in/Log out</Button>
                    </form>
                </Container>
                <Table className='TimeTable' style={{height: '80%'}}>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Time In</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.sessions.sort((a, b) => a.user.name.localeCompare(b.user.name)).map((session, idx) => (
                            <tr key={idx}>
                                <td>{session.user.name}</td>
                                <td>{TimeTable.formatTime(this.state.current_time.diff(moment(session.session.start)) > 0 ?
                                    this.state.current_time.diff(moment(session.session.start)) : 0)}</td>
                            </tr>
                        ))
                    }
                    </tbody>
                </Table>
            </Col>
        );
    }
}
