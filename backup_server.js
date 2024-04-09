const mysql = require('mysql');

// Primary database connection
const primaryConnection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306, // default port for MySQL is 3306
  user: 'root',
  password: '',
  database: 'examengine'
});

// Backup database connection
const backupConnection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306, // default port for MySQL is 3306
  user: 'root',
  password: '',
  database: 'exam_engine_backup'
});

// Connect to primary database
primaryConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to primary database:', err);
    return;
  }
  console.log('Connected to primary database');
});

// Connect to backup database
backupConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to backup database:', err);
    return;
  }
  console.log('Connected to backup database');
});

// Mirroring tables


  console.log("Mirroring started");
  function mirrortable(str) {
    primaryConnection.query('SELECT * FROM '+str, (err, rows) => {
      if (err) {
        console.error('Error selecting '+str+' from primary database:', err);
        return;
      }
  
      if (rows.length === 0) {
        console.log('No '+str+' found in primary database.');
        return;
      }
  
      // Truncate ''+str table in backup database
      backupConnection.query('TRUNCATE TABLE '+str, (err) => {
        if (err) {
          console.error('Error truncating '+str+' table in backup database:', err);
          return;
        }
  
        // Insert rows into ''+str table in backup database one by one
        rows.forEach(row => {
          backupConnection.query('INSERT INTO '+str+' SET ?', row, (err) => {
            if (err) {
              console.error('Error inserting '+str+' into backup database:', err);
              return;
            }
            console.log(`Inserted '${str}' ID ${row.id} into backup database.`);
          });
        });
  
        console.log('Successfully mirrored exammasters table from primary database to backup database.');
      });
    });
  }



function fullsync()
{
  const table_list=['candidates', 'exammasters', 'exam_set_a_logs','exam_set_b_logs','exam_set_c_logs','exam_set_d_logs','exm_questions','feedback_logs','feedbacks','instructions','languages','set_a_question_papers','set_b_question_papers','set_c_question_papers','set_d_question_papers','subjects']
  table_list.forEach(element => { 
    mirrortable(element)
    });

}
function drive_sync()
{
  const table_list=['candidates', 'exammasters', 'exam_set_a_logs','exam_set_b_logs','exam_set_c_logs','exam_set_d_logs','exm_questions','feedback_logs','feedbacks']
  table_list.forEach(element => { 
    mirrortable(element)

    });
}
//mirrortable('candidates')
//fullsync()
console.log("Mirroring completed");
// Mirror 'candidates' table every 5 minutes
//setInterval(mirrorcandidatesTable, 5 * 60 * 1000);
setInterval(drive_sync,20*1000)