<?php
	$version = "A0.1";
	$environment = "LOCAL";
	$contextPath = "/7DRL15/";
	
	if ($environment == "SERVER"){
		$contextPath = "/games/7DRL15/"; 
		
		if ($_SERVER['HTTP_HOST'] == "games.jucarave.net" || $_SERVER['HTTP_HOST'] == "games.jucarave.com")
			$contextPath = "/7DRL15/";
	} 
?>