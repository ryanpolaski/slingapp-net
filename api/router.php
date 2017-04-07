<?php
/**
 * Created by PhpStorm.
 * User: Ian Murphy
 * Date: 3/23/2017
 * Time: 11:22 AM
 */



require_once "routes.php";
$requested_resource = $_GET['resource'];

foreach (API_ROUTES as $route) {
    $pattern = $route[0];
    $file    = $route[1];
    $view    = $route[2];
    if(preg_match("#" . $pattern . "#", $requested_resource, $matches)){
        $parameters = array_slice($matches, 1);
        ob_start();
        require_once "./views/" . $file;
        $output = call_user_func_array($view, $parameters);
        ob_get_clean();
        if(!is_a($output, "HTTPResponse")){
            $error_message = "View '$view' does not return an HTTPResponse object.";
            echo $error_message;
            http_response_code(500);
            throw new Exception($error_message);

        }else{
            echo $output;
        }
    }

}

