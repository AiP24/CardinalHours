//Copy-pasted from UserDisplay
import React, {Component} from 'react';
import {
    Container,
    Button,
    Input,
    InputGroup
} from 'reactstrap';

import UserStore from '../state/UserStore';

export default class LoginDisplay extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    onSubmit(e) {
        e.preventDefault();

        const user = {
            id: this.state.id
        };

        const match = DB.query({
            id: this.state.hidden_id
        });

        if (match) {
            const index = DB.activeUsers.findIndex(session => session.user.id === match.id);

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

        this.setState({
            hidden_id: ''
        });

        this.setState({
            name: '',
            id: ''
        });
    }

    render() {
        return (
            <Container className='UserDisplay'>
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
        );
    }
}
