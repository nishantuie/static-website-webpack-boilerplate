import 'bootstrap';
import '../../common/js/custom';
import '../scss/index.scss';

export class Dashboard {
  constructor() {
    console.log('------- Dashboard Constructor Called -------');
    this._localFunction();
  }

  _localFunction() {
    console.log('Local function called from constructor');
  }

  publicFunction() {
    console.log('Public Function Called from another JS');
    $('#alert').click(() => {
      alert('jQuery works!');
    });
  }
}

var dashboard = new Dashboard();

// export the Class and the shared instance
export default dashboard;
