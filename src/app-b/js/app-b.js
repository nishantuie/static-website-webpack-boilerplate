import 'bootstrap';
import '../scss/index.scss';
import dashboard from '../../app-a/js/app-a';

$('#alert').click(() => {
  //alert('jQuery works!');
  dashboard.publicFunction();
});

// Your jQuery code
