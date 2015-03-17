<?php
	$version = "A0.2";
	$environment = "LOCAL";
	$contextPath = "/stygian/";
	
	if ($environment == "SERVER"){
		$contextPath = "/games/stygian/"; 
		
		if ($_SERVER['HTTP_HOST'] == "games.jucarave.net" || $_SERVER['HTTP_HOST'] == "games.jucarave.com")
			$contextPath = "/stygian/";
	} 
?>