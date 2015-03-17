<?php 
	require("system/config.php");
	$ver = "?version=" . $version; 
?>
<!DOCTYPE HTML>
<html>
	<head>
		<title>Stygian Abyss</title>
		
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/Vec.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/Utils.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/ObjectFactory.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/Matrix.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/Audio.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/WebGL.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/UI.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/Underworld.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/MapAssembler.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/MapManager.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/Player.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/TitleScreen.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/SelectClass.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/AnimatedTexture.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/Door.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/Billboard.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/Console.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/Inventory.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/Item.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/Enemy.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/ItemFactory.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/Object3D.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/EnemyFactory.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/PlayerStats.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/Missile.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/stygianGen.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="<?php echo $contextPath; ?>js/Stairs.js<?php echo $ver; ?>"></script>
		
		<script type="text/javascript">
			var version = "<?php echo $version; ?>";
			var cp = "<?php echo $contextPath; ?>";
		</script>
		
		<script id="vertexShader" type="x-shader/x-vertex"><?php require("shaders/vertexShader"); ?></script>
		<script id="fragmentShader" type="x-shader/x-fragment"><?php require("shaders/fragmentShader"); ?></script>
		
		<style>
			body { background-color: black; }
			#divGame {
				left: 0px;
				top: 0px;
				width: 100%;
				height: 100%;
				text-align: center;
				position: absolute;
			}
			
			canvas{ 
				left: 0px;
				right: 0px;
				margin: auto;
				
				image-rendering: optimizeSpeed;             /* Older versions of FF */
			    image-rendering: -moz-crisp-edges;          /* FF 6.0+ */
			    image-rendering: -webkit-optimize-contrast; /* Safari */
			    image-rendering: -o-crisp-edges;            /* OS X & Windows Opera (12.02+) */
			    image-rendering: pixelated;                 /* Awesome future-browsers */
			    -ms-interpolation-mode: nearest-neighbor;   /* IE  */
			}
		</style>
	</head>
	
	<body>
		<div id="divGame" ></div>
	</body>
	
</html>