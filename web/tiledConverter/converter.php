<?php
	function createTile($w, $y, $h, $c, $f, $ch, $dw, $aw, $sl, $dir, $fy, $wd, $wd_ver){
		global $globTiles;
		
		for ($i=1;$i<sizeof($globTiles);$i++){
			$tile = $globTiles[$i];
			
			$a = $tile->{"w"} == $w && $tile->{"y"} == $y && $tile->{"h"} == $h && $tile->{"c"} == $c && $tile->{"f"} == $f && $tile->{"ch"} == $ch && $tile->{"dw"} == $dw;
			$b = $tile->{"aw"} == $aw && $tile->{"sl"} == $sl && $tile->{"dir"} == $dir && $tile->{"fy"} == $fy && $tile->{"wd"} == $wd && $tile->{"wd_ver"} == $wd_ver;
			if ($a && $b){
				return $i;
			}
		}
		
		$tile = new stdClass();
		$tile->{"w"} = $w;
		$tile->{"y"} = $y;
		$tile->{"h"} = $h;
		$tile->{"c"} = $c;
		$tile->{"f"} = $f;
		$tile->{"ch"} = $ch;
		$tile->{"dw"} = $dw;
		$tile->{"aw"} = $aw;
		$tile->{"sl"} = $sl;
		$tile->{"dir"} = $dir;
		$tile->{"fy"} = $fy;
		$tile->{"wd"} = $wd;
		$tile->{"wd_ver"} = $wd_ver;
		
		$ind = sizeof($globTiles);
		$globTiles[$ind] = $tile;
		
		return $ind;
	}
	
	// Global tiles
	$result = new stdClass();
	$globTiles = array(null);
	$globObjects = array();
	
	// Create the empty map
	$rMap = array();
	for ($i=0;$i<64;$i++){
		$rMap[$i] = array();
		for ($j=0;$j<64;$j++){
			$rMap[$i][$j] = 0;
		}
	}
	
	// Load the file
	$file = file_get_contents("map.json");
	$jsonMap = json_decode($file);
	$layers = $jsonMap->{"layers"};
	
	$emptyObj = new stdClass();
	
	// Parse the map
	for ($y=0;$y<64;$y++){
		for ($x=0;$x<64;$x++){
			$tile = 0;
			
			// Properties of the tile
			$bu_w = 0;		// Texture of Wall
			$bu_y = 0;		// Position y
			$bu_h = 0;		// Height of tile
			$bu_c = 0;		// Texture of ceil
			$bu_f = 0;		// Texture of floor
			$bu_ch = 1;		// Position of ceil
			$bu_dw = 0;		// Diagonal Wall Texture
			$bu_aw = 0;		// Angle of Diagonal Wall
			$bu_sl = 0;		// Texture of slope
			$bu_dir = 0;	// Direction of slope
			$bu_fy = null;	// Forced floor position
			$bu_wd = 0;		// Wall Door Texture
			$bu_wd_ver = false;		// Wall Door Texture
			
			$noTile = true;
			$mdtY = false;
			foreach ($layers as $l){
				if (isset($l->{"data"})){
					$data = $l->{"data"};
					$properties = $emptyObj;
					if (isset($l->{"properties"})) $properties = $l->{"properties"};
					$t = $data[$x + ($y * 64)];
					if ($t != 0){
						$noTile = false;
						
						$typeof = $t % 16;
						if ($typeof == 1){ // Wall tile
							$bu_w = floor($t / 16) + 1;
						}else if ($typeof >= 2 && $typeof <= 5){ // Angled Wall tile
							$bu_dw = floor($t / 16) + 1;
							$bu_aw = $typeof - 2;
						}else if ($typeof == 6){ // Floor tile
							$bu_f = floor($t / 16) + 1;
						}else if ($typeof >= 7 && $typeof <= 10){ // Slope tile
							$bu_sl = floor($t / 16) + 1;
							$bu_dir = $typeof - 7;
						}else if ($typeof == 11){ // Ceil tile
							$bu_c = floor($t / 16) + 1;
						}else if ($typeof == 12){ // Water tile
							$bu_f = floor($t / 16) + 101;
						}else if ($typeof == 13 || $typeof == 14){ // Door tile
							$bu_wd = floor($t / 16) + 1;
							$bu_wd_ver = ($typeof == 13);
						}
						
						if (isset($properties->{"y"})){
							if (!$mdtY) $bu_y = (real)$properties->{"y"};
							if ($typeof == 1) $mdtY = true;
						}
						if (isset($properties->{"height"})) $bu_h = (real)$properties->{"height"};
						if (isset($properties->{"ceil_y"})) $bu_ch = (real)$properties->{"ceil_y"};
						if (isset($properties->{"floor_y"})) $bu_fy = (real)$properties->{"floor_y"};
					}
				}
			}

			if (($bu_w || $bu_dw) && $bu_h === 0) $bu_h = 1;
			
			if (!$noTile){
				if ($bu_fy === null) $bu_fy = $bu_y;
				$ind = createTile($bu_w, $bu_y, $bu_h, $bu_c, $bu_f, $bu_ch, $bu_dw, $bu_aw, $bu_sl, $bu_dir, $bu_fy, $bu_wd, $bu_wd_ver);
				
				$rMap[$y][$x] = $ind;
			}
		}
	}

	foreach ($layers as $l){
		if (isset($l->{"objects"})){
			$objects = $l->{"objects"};
			foreach ($objects as $o){
				$o_x = floor(((real)$o->{"x"}) / 16);
				$o_y = floor(((real)$o->{"y"}) / 16);
				
				$obj = new stdClass();
				$obj->{"x"} = $o_x;
				$obj->{"z"} = $o_y - 1;
				
				$properties = $o->{"properties"};
				$type = $o->{"type"};
				
				$obj->{"y"} = (isset($properties->{"z"}))? (real)$properties->{"z"} : 0;
				switch ($type){
					case "player":
						$o_dir = (real)$properties->{"direction"};
						
						$obj->{"dir"} = $o_dir;
						$obj->{"type"} = "player";
						$globObjects[sizeof($globObjects)] = $obj;
					break;
					case "door":
						$o_dir = $properties->{"direction"};
						
						$obj->{"dir"} = $o_dir;
						$obj->{"type"} = "door";
						$globObjects[sizeof($globObjects)] = $obj;
					break;
				}
			}
		}
	}
	
	// Print the result map
	$result->{"tiles"} = $globTiles;
	$result->{"objects"} = $globObjects;
	$result->{"map"} = $rMap;
	echo json_encode($result);
?>