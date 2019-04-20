export default class User {
    constructor(props) {
        this.name = props.name;
        this.id = props.id;
        this.email = props.email;
        this.hasSigned = props.hasSigned;
        this.token = props.token;
    }
}