<?php

/**
 * @author chelsea
 * @copyright 2013
 */

sleep(5);
$errno = $_POST['username']=='hcp'?0:1;
echo json_encode(array('error'=>$errno,'errstr'=>'此用户名已存在'));

?>