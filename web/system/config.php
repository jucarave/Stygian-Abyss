<?php
	$version = "1.3";
	$environment = "LOCAL";
	$contextPath = "/sab/";
	
	if ($environment == "SERVER"){
		$contextPath = "/games/stygian/"; 
		
		if ($_SERVER['HTTP_HOST'] == "games.jucarave.net" || $_SERVER['HTTP_HOST'] == "games.jucarave.com")
			$contextPath = "/stygian/";
		if ($_SERVER['HTTP_HOST'] == "slashie.net")
			$contextPath = "/stygian/play/";
	} 
?>